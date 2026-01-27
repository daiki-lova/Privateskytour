import type { Metadata, ResolvingMetadata } from "next";
import { CourseDetail } from "@/components/public/CourseDetail";
import { getPublicCourseById } from "@/lib/supabase/actions/courses";

// ベースURLを環境変数から取得（フォールバック付き）
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://tour.privatesky.co.jp";

// 型定義: ルートパラメータ
type Props = {
  params: Promise<{ planId: string }>;
};

/**
 * コース詳細ページのメタデータを動的に生成
 * - OGP (Open Graph Protocol) 対応
 * - Twitter Card 対応
 */
export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { planId } = await params;

  // コース情報を取得
  const course = await getPublicCourseById(planId);

  // コースが見つからない場合のフォールバック
  if (!course) {
    return {
      title: "プランが見つかりません | ヘリフロント",
      description: "お探しのプランは存在しないか、削除された可能性があります。",
    };
  }

  // OGP用の画像URL（相対パスの場合は絶対パスに変換）
  const ogImage = course.image.startsWith("http")
    ? course.image
    : `${BASE_URL}${course.image}`;

  // ページURL
  const pageUrl = `${BASE_URL}/tours/${planId}`;

  // 説明文（150文字以内に切り詰め）
  const description = course.description
    ? course.description.slice(0, 150) + (course.description.length > 150 ? "..." : "")
    : `${course.title} - ${course.duration}のヘリコプターツアー。最大${course.capacity}名様まで搭乗可能。`;

  return {
    // ページタイトル
    title: `${course.title} | ヘリフロント`,
    description,

    // Open Graph メタデータ
    openGraph: {
      type: "website",
      url: pageUrl,
      title: course.title,
      description,
      siteName: "ヘリフロント",
      locale: "ja_JP",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },

    // Twitter Card メタデータ
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
      images: [ogImage],
    },

    // その他のメタデータ
    alternates: {
      canonical: pageUrl,
    },
  };
}

/**
 * コース詳細ページ
 */
export default async function TourDetailPage({ params }: Props) {
  const { planId } = await params;
  return <CourseDetail planId={planId} />;
}
