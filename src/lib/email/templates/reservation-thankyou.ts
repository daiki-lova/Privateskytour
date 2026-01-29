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
      <td align="center" style="padding: 20px 8px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 24px; text-align: center;">
              <img src="https://tour.privatesky.co.jp/logo-header.png" alt="PrivateSky Tour" style="height: 40px; display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 8px 24px 16px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; color: #1a1a1a; font-weight: 600;">
                ご搭乗ありがとうございました
              </h2>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                ${customerName} 様<br><br>
                この度はPrivateSky Tourをご利用いただき、誠にありがとうございました。<br>
                ${flightDate}の「${courseName}」はいかがでしたでしょうか？<br><br>
                空からの景色を楽しんでいただけましたら幸いです。
              </p>
            </td>
          </tr>

          <!-- Flight Memory -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">予約番号</p>
                    <p style="margin: 0 0 16px; font-size: 18px; color: #1a1a1a; font-weight: 700; letter-spacing: 2px;">${bookingNumber}</p>
                    <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">ご搭乗日</p>
                    <p style="margin: 0 0 16px; font-size: 18px; color: #1a1a1a; font-weight: 700;">${flightDate}</p>
                    <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">コース</p>
                    <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">${courseName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Booking CTA -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 12px; font-size: 16px; color: #1a1a1a; font-weight: 700;">
                      次回のご予約をお待ちしております
                    </p>
                    <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280; line-height: 1.6;">
                      季節や時間帯によって異なる景色をお楽しみいただけます。<br>
                      夜景フライトや特別コースもおすすめです。
                    </p>
                    <a href="${bookingUrl}" style="display: inline-block; background-color: #0066FF; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                      次回の予約はこちら
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SNS Share Section -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px; font-size: 14px; color: #1a1a1a; font-weight: 600;">
                      思い出をシェアしませんか？
                    </p>
                    <p style="margin: 0 0 12px; font-size: 13px; color: #6b7280; line-height: 1.6;">
                      撮影した写真や動画をSNSでシェアしていただけると嬉しいです。<br>
                      ぜひ以下のハッシュタグをお使いください：
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #1a1a1a; font-weight: 600; background-color: #ffffff; padding: 10px 16px; border-radius: 6px; border: 1px solid #e5e7eb; display: inline-block;">
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
            <td style="padding: 0 24px 32px; text-align: center;">
              <a href="${mypageUrl}" style="display: inline-block; background-color: #f9fafb; color: #1a1a1a; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid #e5e7eb;">
                マイページで予約履歴を確認
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a; text-align: center; font-weight: 600;">
                またのご利用を心よりお待ちしております。
              </p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #6b7280; text-align: center;">
                ご意見・ご感想がございましたら、お気軽にお知らせください。
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
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
