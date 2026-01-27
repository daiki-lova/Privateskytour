import type { CancellationConfirmationParams } from '../client';

/**
 * 予約キャンセル確認メールテンプレート
 * HTMLとプレーンテキストの両方を生成
 */
export function reservationCancelledTemplate(params: CancellationConfirmationParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
    courseName,
    flightDate,
    flightTime,
    bookingNumber,
    cancellationFee,
    refundAmount,
    originalAmount,
  } = params;

  const formattedCancellationFee = cancellationFee.toLocaleString('ja-JP');
  const formattedRefundAmount = refundAmount.toLocaleString('ja-JP');
  const formattedOriginalAmount = originalAmount.toLocaleString('ja-JP');

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>予約キャンセル完了 - PrivateSky Tour</title>
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

          <!-- Cancelled Badge -->
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center;">
              <div style="display: inline-block; background-color: #6b7280; color: #ffffff; padding: 8px 24px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                予約がキャンセルされました
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 40px 24px;">
              <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.8;">
                ${customerName} 様<br><br>
                ご予約のキャンセルを承りました。<br>
                またのご利用を心よりお待ちしております。
              </p>
            </td>
          </tr>

          <!-- Cancelled Booking Details -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">予約番号</p>
                          <p style="margin: 0; font-size: 20px; color: #1a1a2e; font-weight: 700; letter-spacing: 2px;">${bookingNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">コース</p>
                          <p style="margin: 0; font-size: 16px; color: #333333; font-weight: 600;">${courseName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">搭乗予定日</p>
                                <p style="margin: 0; font-size: 16px; color: #333333; font-weight: 600;">${flightDate}</p>
                              </td>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">搭乗予定時刻</p>
                                <p style="margin: 0; font-size: 16px; color: #333333; font-weight: 600;">${flightTime}</p>
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

          <!-- Refund Details -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-radius: 8px; border: 1px solid #fde68a;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 16px; color: #92400e; font-weight: 700;">返金について</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #fde68a;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td>
                                <p style="margin: 0; font-size: 14px; color: #78350f;">お支払い金額</p>
                              </td>
                              <td style="text-align: right;">
                                <p style="margin: 0; font-size: 14px; color: #78350f;">&yen;${formattedOriginalAmount}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #fde68a;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td>
                                <p style="margin: 0; font-size: 14px; color: #78350f;">キャンセル料</p>
                              </td>
                              <td style="text-align: right;">
                                <p style="margin: 0; font-size: 14px; color: #78350f;">- &yen;${formattedCancellationFee}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td>
                                <p style="margin: 0; font-size: 16px; color: #92400e; font-weight: 700;">返金予定額</p>
                              </td>
                              <td style="text-align: right;">
                                <p style="margin: 0; font-size: 20px; color: #92400e; font-weight: 700;">&yen;${formattedRefundAmount}</p>
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
                    <p style="margin: 0 0 8px; font-size: 14px; color: #1e40af; font-weight: 600;">ご返金について</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e40af; line-height: 1.6;">
                      <li>ご返金はお支払いに使用されたカードへ行われます</li>
                      <li>返金処理には5〜10営業日程度かかる場合がございます</li>
                      <li>返金完了時に別途メールでお知らせいたします</li>
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
【予約キャンセル完了】PrivateSky Tour

${customerName} 様

ご予約のキャンセルを承りました。
またのご利用を心よりお待ちしております。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 予約番号: ${bookingNumber}

■ コース: ${courseName}

■ 搭乗予定日時: ${flightDate} ${flightTime}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【返金について】

お支払い金額: ¥${formattedOriginalAmount}
キャンセル料: - ¥${formattedCancellationFee}
----------------------------
返金予定額: ¥${formattedRefundAmount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ご返金について】
・ご返金はお支払いに使用されたカードへ行われます
・返金処理には5〜10営業日程度かかる場合がございます
・返金完了時に別途メールでお知らせいたします

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
