import type { RefundNotificationParams } from '../client';

/**
 * 返金完了メールテンプレート
 * HTMLとプレーンテキストの両方を生成
 */
export function refundCompletedTemplate(params: RefundNotificationParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
    courseName,
    bookingNumber,
    refundAmount,
    cardLast4,
    refundDate,
  } = params;

  const formattedRefundAmount = refundAmount.toLocaleString('ja-JP');
  const cardInfo = cardLast4 ? `**** **** **** ${cardLast4}` : 'ご登録のクレジットカード';

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>返金完了のお知らせ - PrivateSky Tour</title>
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

          <!-- Success Badge -->
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center;">
              <div style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 8px 24px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                返金処理が完了しました
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 40px 24px;">
              <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.8;">
                ${customerName} 様<br><br>
                キャンセルに伴う返金処理が完了いたしました。<br>
                ご利用のカード会社により、実際の返金がご確認いただけるまでに数日かかる場合がございます。
              </p>
            </td>
          </tr>

          <!-- Refund Details -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #bbf7d0;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 1px;">予約番号</p>
                          <p style="margin: 0; font-size: 18px; color: #166534; font-weight: 700; letter-spacing: 2px;">${bookingNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #bbf7d0;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 1px;">コース</p>
                          <p style="margin: 0; font-size: 16px; color: #166534; font-weight: 600;">${courseName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #bbf7d0; text-align: center;">
                          <p style="margin: 0 0 8px; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 1px;">返金額</p>
                          <p style="margin: 0; font-size: 32px; color: #166534; font-weight: 700;">&yen;${formattedRefundAmount}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #bbf7d0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 1px;">返金先</p>
                                <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">${cardInfo}</p>
                              </td>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 1px;">処理日</p>
                                <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">${refundDate}</p>
                              </td>
                            </tr>
                          </table>
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
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #1e40af; font-weight: 600;">ご確認ください</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e40af; line-height: 1.6;">
                      <li>カード会社によっては、明細への反映まで数日〜数週間かかる場合がございます</li>
                      <li>ご不明な点がある場合は、カード会社へお問い合わせいただくか、当社までご連絡ください</li>
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
                またのご利用を心よりお待ちしております。
              </p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #64748b; text-align: center;">
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
【返金完了のお知らせ】PrivateSky Tour

${customerName} 様

キャンセルに伴う返金処理が完了いたしました。
ご利用のカード会社により、実際の返金がご確認いただけるまでに数日かかる場合がございます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 予約番号: ${bookingNumber}

■ コース: ${courseName}

■ 返金額: ¥${formattedRefundAmount}

■ 返金先: ${cardInfo}

■ 処理日: ${refundDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ご確認ください】
・カード会社によっては、明細への反映まで数日〜数週間かかる場合がございます
・ご不明な点がある場合は、カード会社へお問い合わせいただくか、当社までご連絡ください

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

またのご利用を心よりお待ちしております。
ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
