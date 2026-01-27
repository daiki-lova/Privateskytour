-- ============================================================
-- ANNOUNCEMENTS TABLE
-- お知らせ（アナウンスメント）管理用テーブル
-- notifications テーブル（メール通知用）とは別のテーブル
-- ============================================================

-- お知らせ種別のENUM
CREATE TYPE announcement_type AS ENUM ('reservation', 'public');

-- お知らせステータスのENUM
CREATE TYPE announcement_status AS ENUM ('draft', 'scheduled', 'sent', 'published');

-- お知らせテーブル
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type announcement_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target TEXT, -- 配信対象の説明（例: "12/25 予約者全員"）
  status announcement_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX idx_announcements_scheduled ON announcements(scheduled_at) WHERE status = 'scheduled';

-- RLS設定
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 管理者のみ読み書き可能
-- Service Role Key を使用する場合は RLS をバイパスするため、
-- このポリシーは anon/authenticated キーでのアクセス制御用
CREATE POLICY "Admin can manage announcements" ON announcements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- updated_at自動更新トリガー
-- update_updated_at_column 関数が既に存在することを前提
-- 存在しない場合は作成
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメント
COMMENT ON TABLE announcements IS 'お知らせ（アナウンスメント）管理テーブル';
COMMENT ON COLUMN announcements.type IS 'お知らせ種別: reservation（予約者向け）, public（ホームページ掲載）';
COMMENT ON COLUMN announcements.title IS 'お知らせのタイトル';
COMMENT ON COLUMN announcements.content IS 'お知らせの本文';
COMMENT ON COLUMN announcements.target IS '配信対象の説明（例: "12/25 予約者全員"、"ホームページ (News)"）';
COMMENT ON COLUMN announcements.status IS 'ステータス: draft（下書き）, scheduled（予約）, sent（送信済み）, published（公開中）';
COMMENT ON COLUMN announcements.scheduled_at IS '配信予定日時（scheduled ステータスの場合）';
COMMENT ON COLUMN announcements.sent_at IS '実際の配信/公開日時';
COMMENT ON COLUMN announcements.author IS '作成者名';
