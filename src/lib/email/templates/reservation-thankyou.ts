/**
 * お礼メールのパラメータ
 */
export type ThankYouEmailParams = {
  to: string;
  customerName: string;
  courseName: string;
  flightDate: string;
  bookingNumber: string;
  mypageUrl?: string;
};

/**
 * 搭乗翌日お礼メールテンプレート
 * お礼メッセージ、次回予約の案内、SNSシェアの案内を含む
 */
export function reservationThankYouTemplate(params: ThankYouEmailParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
    courseName,
    flightDate,
    bookingNumber,
    mypageUrl,
  } = params;

  // 次回予約URL
  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://tour.privatesky.co.jp'}/booking`;
  // SNSシェア用ハッシュタグ
  const hashtag = '#PrivateSkyTour #ヘリコプター遊覧 #空の旅';

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ご搭乗ありがとうございました - PrivateSky Tour</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 2px;">
                PrivateSky Tour
              </h1>
            </td>
          </tr>

          <!-- Thank You Badge -->
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center;">
              <div style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 8px 24px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                ご搭乗ありがとうございました
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 40px 24px;">
              <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.8;">
                ${customerName} 様<br><br>
                この度はPrivateSky Tourをご利用いただき、誠にありがとうございました。<br>
                ${flightDate}の「${courseName}」はいかがでしたでしょうか？<br><br>
                空からの景色を楽しんでいただけましたら幸いです。
              </p>
            </td>
          </tr>

          <!-- Flight Memory -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">予約番号</p>
                    <p style="margin: 0 0 16px; font-size: 18px; color: #1e40af; font-weight: 700; letter-spacing: 2px;">${bookingNumber}</p>
                    <p style="margin: 0 0 8px; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">ご搭乗日</p>
                    <p style="margin: 0 0 16px; font-size: 18px; color: #1e40af; font-weight: 700;">${flightDate}</p>
                    <p style="margin: 0 0 8px; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">コース</p>
                    <p style="margin: 0; font-size: 16px; color: #1e3a5f; font-weight: 600;">${courseName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Booking CTA -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 12px; font-size: 16px; color: #92400e; font-weight: 700;">
                      次回のご予約をお待ちしております
                    </p>
                    <p style="margin: 0 0 16px; font-size: 14px; color: #a16207; line-height: 1.6;">
                      季節や時間帯によって異なる景色をお楽しみいただけます。<br>
                      夜景フライトや特別コースもおすすめです。
                    </p>
                    <a href="${bookingUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      次回の予約はこちら
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SNS Share Section -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px; font-size: 14px; color: #0369a1; font-weight: 600;">
                      思い出をシェアしませんか？
                    </p>
                    <p style="margin: 0 0 12px; font-size: 13px; color: #0369a1; line-height: 1.6;">
                      撮影した写真や動画をSNSでシェアしていただけると嬉しいです。<br>
                      ぜひ以下のハッシュタグをお使いください：
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #0284c7; font-weight: 600; background-color: #e0f2fe; padding: 10px 16px; border-radius: 6px; display: inline-block;">
                      ${hashtag}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Mypage Link -->
          ${mypageUrl ? `
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${mypageUrl}" style="display: inline-block; background-color: #f1f5f9; color: #475569; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid #e2e8f0;">
                マイページで予約履歴を確認
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #475569; text-align: center; font-weight: 600;">
                またのご利用を心よりお待ちしております。
              </p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #64748b; text-align: center;">
                ご意見・ご感想がございましたら、お気軽にお知らせください。
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                PrivateSky Tour | info@privatesky.co.jp
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
【ご搭乗ありがとうございました】PrivateSky Tour

${customerName} 様

この度はPrivateSky Tourをご利用いただき、誠にありがとうございました。
${flightDate}の「${courseName}」はいかがでしたでしょうか？

空からの景色を楽しんでいただけましたら幸いです。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 予約番号: ${bookingNumber}
■ ご搭乗日: ${flightDate}
■ コース: ${courseName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【次回のご予約をお待ちしております】
季節や時間帯によって異なる景色をお楽しみいただけます。
夜景フライトや特別コースもおすすめです。

▼ 次回の予約はこちら
${bookingUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【思い出をシェアしませんか？】
撮影した写真や動画をSNSでシェアしていただけると嬉しいです。
ぜひ以下のハッシュタグをお使いください：

${hashtag}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${mypageUrl ? `
▼ マイページで予約履歴を確認
${mypageUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}
またのご利用を心よりお待ちしております。
ご意見・ご感想がございましたら、お気軽にお知らせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
