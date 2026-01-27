/**
 * マイページアクセス用メールテンプレート
 * トークン付きのマイページURLを顧客に送信する
 */

export type MypageAccessParams = {
  customerName: string;
  mypageUrl: string;
  expiresAt: string;
};

/**
 * マイページアクセスメールテンプレート
 * HTMLとプレーンテキストの両方を生成
 */
export function mypageAccessTemplate(params: MypageAccessParams): {
  html: string;
  text: string;
} {
  const { customerName, mypageUrl, expiresAt } = params;

  // 有効期限を日本語でフォーマット
  const expiresDate = new Date(expiresAt);
  const formattedExpires = `${expiresDate.getFullYear()}年${expiresDate.getMonth() + 1}月${expiresDate.getDate()}日`;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>マイページアクセス - PrivateSky Tour</title>
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

          <!-- Title -->
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; color: #1a1a2e; font-weight: 600;">
                マイページへのアクセス
              </h2>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 40px 24px;">
              <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.8;">
                ${customerName} 様<br><br>
                マイページへのアクセスリクエストを受け付けました。<br>
                下記のボタンをクリックして、予約状況の確認やキャンセルなどをご利用いただけます。
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${mypageUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                マイページにアクセス
              </a>
            </td>
          </tr>

          <!-- Link Info -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">
                      <strong>リンクの有効期限:</strong> ${formattedExpires}
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #94a3b8; word-break: break-all;">
                      ボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください:<br>
                      <a href="${mypageUrl}" style="color: #3b82f6;">${mypageUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600;">セキュリティに関するご注意</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #92400e; line-height: 1.6;">
                      <li>このリンクは個人専用です。他の方と共有しないでください。</li>
                      <li>心当たりのない場合は、このメールを無視してください。</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-align: center;">
                ご不明な点がございましたら、お気軽にお問い合わせください。
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
【マイページアクセス】PrivateSky Tour

${customerName} 様

マイページへのアクセスリクエストを受け付けました。
下記のURLから、予約状況の確認やキャンセルなどをご利用いただけます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ マイページにアクセス
${mypageUrl}

リンクの有効期限: ${formattedExpires}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【セキュリティに関するご注意】
・このリンクは個人専用です。他の方と共有しないでください。
・心当たりのない場合は、このメールを無視してください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
