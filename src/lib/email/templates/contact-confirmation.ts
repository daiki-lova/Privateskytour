import type { ContactConfirmationParams } from '../client';

/**
 * お問い合わせ受付確認メールテンプレート（お客様宛）
 * HTMLとプレーンテキストの両方を生成
 */
export function contactConfirmationTemplate(params: ContactConfirmationParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
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
  <title>お問い合わせ受付 - PrivateSky Tour</title>
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
                お問い合わせを受け付けました
              </h2>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                ${customerName} 様<br><br>
                この度はPrivateSky Tourへお問い合わせいただき、誠にありがとうございます。<br>
                以下の内容でお問い合わせを受け付けました。<br>
                担当者より2営業日以内にご連絡いたしますので、今しばらくお待ちください。
              </p>
            </td>
          </tr>

          <!-- Inquiry Content -->
          <tr>
            <td style="padding: 0 24px 32px;">
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

          <!-- Notice -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.8;">
                      ※ このメールはお問い合わせの受付確認として自動送信しています。<br>
                      ※ 2営業日を過ぎても返信がない場合は、お手数ですが再度お問い合わせいただくか、お電話にてご連絡ください。
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-align: center;">
                ご不明な点がございましたら、お気軽にお問い合わせください。
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
【お問い合わせ受付】PrivateSky Tour

${customerName} 様

この度はPrivateSky Tourへお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けました。
担当者より2営業日以内にご連絡いたしますので、今しばらくお待ちください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 件名: ${subject}

■ お問い合わせ内容:
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※ このメールはお問い合わせの受付確認として自動送信しています。
※ 2営業日を過ぎても返信がない場合は、お手数ですが再度お問い合わせいただくか、
  お電話にてご連絡ください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
