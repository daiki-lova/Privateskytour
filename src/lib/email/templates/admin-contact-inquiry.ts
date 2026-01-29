import type { AdminContactInquiryParams } from '../client';

/**
 * 管理者向けお問い合わせ通知メールテンプレート
 * HTMLとプレーンテキストの両方を生成
 */
export function adminContactInquiryTemplate(params: AdminContactInquiryParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
    customerEmail,
    customerPhone,
    subject,
    message,
  } = params;

  // メッセージ内の改行をHTML用に変換
  const htmlMessage = message.replace(/\n/g, '<br>');

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お問い合わせ通知 - PrivateSky Tour</title>
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
                お問い合わせがありました
              </h2>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                お問い合わせフォームから新しいメッセージが届きました。
              </p>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #1a1a1a; font-weight: 600;">送信者情報</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">お名前</p>
                          <p style="margin: 0; font-size: 15px; color: #1a1a1a;">${customerName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">メールアドレス</p>
                          <p style="margin: 0; font-size: 15px; color: #1a1a1a;">${customerEmail}</p>
                        </td>
                      </tr>
                      ${customerPhone ? `
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">電話番号</p>
                          <p style="margin: 0; font-size: 15px; color: #1a1a1a;">${customerPhone}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Inquiry Content -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">件名</p>
                          <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">${subject}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">お問い合わせ内容</p>
                          <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">${htmlMessage}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 24px 32px; text-align: center;">
              <a href="https://tour.privatesky.co.jp/admin/notifications" style="display: inline-block; background-color: #0066FF; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                管理画面で確認
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                PrivateSky Tour | 管理者通知
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
【お問い合わせ】PrivateSky Tour

お問い合わせフォームから新しいメッセージが届きました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【送信者情報】
・お名前: ${customerName}
・メールアドレス: ${customerEmail}${customerPhone ? `\n・電話番号: ${customerPhone}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 件名: ${subject}

■ お問い合わせ内容:
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ 管理画面で確認
https://tour.privatesky.co.jp/admin/notifications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PrivateSky Tour | 管理者通知
  `.trim();

  return { html, text };
}
