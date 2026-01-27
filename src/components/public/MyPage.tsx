"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Receipt,
  Plane,
  Info,
} from "lucide-react";
import type {
  MypageData,
  MypageCustomerData,
  MypageReservationData,
} from "@/lib/auth/mypage-token";
import type { CancellationTier } from "@/lib/cancellation/policy";

// Status badge configuration
const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  pending: {
    label: "確認待ち",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
  },
  confirmed: {
    label: "確定",
    variant: "default",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  cancelled: {
    label: "キャンセル済み",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
  },
  completed: {
    label: "完了",
    variant: "outline",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  no_show: {
    label: "未来店",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
  },
  suspended: {
    label: "保留中",
    variant: "secondary",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "未払い", color: "text-amber-600 bg-amber-50" },
  paid: { label: "支払済", color: "text-emerald-600 bg-emerald-50" },
  failed: { label: "失敗", color: "text-red-600 bg-red-50" },
  refunded: { label: "返金済", color: "text-slate-600 bg-slate-100" },
  partial_refund: { label: "一部返金", color: "text-slate-600 bg-slate-100" },
  unpaid: { label: "未払い", color: "text-amber-600 bg-amber-50" },
};

// Cancellation dialog state
interface CancellationState {
  isOpen: boolean;
  isLoading: boolean;
  reservation: MypageReservationData | null;
  cancellationInfo: {
    totalPrice: number;
    feePercentage: number;
    cancellationFee: number;
    refundAmount: number;
    daysUntil: number;
    canCancel: boolean;
    reason?: string;
  } | null;
  policy: CancellationTier[];
  error: string | null;
  isConfirming: boolean;
  isSuccess: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日(${weekday})`;
}

function formatTime(timeString: string): string {
  return timeString.slice(0, 5);
}

function formatPrice(price: number): string {
  return price.toLocaleString("ja-JP");
}

// Receipt generation (print-based)
function generateReceiptHTML(
  reservation: MypageReservationData,
  customer: MypageCustomerData
): string {
  const date = new Date();
  const receiptDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>領収書 - ${reservation.bookingNumber}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #1e293b;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #003366;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      color: #003366;
      margin: 0;
      letter-spacing: 0.2em;
    }
    .receipt-number {
      font-size: 12px;
      color: #64748b;
      margin-top: 10px;
    }
    .customer-section {
      margin-bottom: 30px;
    }
    .customer-name {
      font-size: 20px;
      font-weight: bold;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 10px;
    }
    .amount-section {
      background: #f8fafc;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
      border-radius: 8px;
    }
    .amount-label {
      font-size: 14px;
      color: #64748b;
    }
    .amount-value {
      font-size: 32px;
      font-weight: bold;
      color: #003366;
      margin-top: 10px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .details-table th {
      background: #f1f5f9;
      text-align: left;
      padding: 12px;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
    .details-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .company-info {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    .company-name {
      font-size: 14px;
      font-weight: bold;
      color: #1e293b;
    }
    .stamp-area {
      float: right;
      width: 80px;
      height: 80px;
      border: 2px solid #e2e8f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #cbd5e1;
      font-size: 10px;
    }
    .invoice-note {
      margin-top: 20px;
      padding: 15px;
      background: #fef3c7;
      border-radius: 8px;
      font-size: 11px;
      color: #92400e;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>領 収 書</h1>
    <p class="receipt-number">No. ${reservation.bookingNumber}</p>
  </div>

  <div class="customer-section">
    <p class="customer-name">${customer.name} 様</p>
  </div>

  <div class="amount-section">
    <p class="amount-label">金額</p>
    <p class="amount-value">¥${formatPrice(reservation.totalPrice)}-</p>
    <p style="font-size: 12px; color: #64748b; margin-top: 5px;">
      (税込)
    </p>
  </div>

  <table class="details-table">
    <tr>
      <th>品目</th>
      <td>${reservation.course?.title ?? "ヘリコプター遊覧飛行"}</td>
    </tr>
    <tr>
      <th>搭乗日時</th>
      <td>${formatDate(reservation.reservationDate)} ${formatTime(reservation.reservationTime)}</td>
    </tr>
    <tr>
      <th>搭乗人数</th>
      <td>${reservation.pax}名</td>
    </tr>
    <tr>
      <th>発着場所</th>
      <td>${reservation.heliport?.name ?? "-"}</td>
    </tr>
    <tr>
      <th>発行日</th>
      <td>${receiptDate}</td>
    </tr>
  </table>

  <p style="text-align: center; margin: 20px 0; font-size: 14px;">
    上記の金額を正に領収いたしました。
  </p>

  <div class="invoice-note">
    <strong>適格請求書等保存方式（インボイス制度）対応</strong><br>
    登録番号: T1234567890123（例）
  </div>

  <div class="company-info">
    <div class="stamp-area">印</div>
    <p class="company-name">PRIVATESKY株式会社</p>
    <p>〒135-0091 東京都港区台場1-1-1</p>
    <p>TEL: 03-1234-5678</p>
    <p>Email: info@privatesky.jp</p>
  </div>

  <div class="no-print" style="margin-top: 40px; text-align: center;">
    <button onclick="window.print()" style="
      background: #003366;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    ">
      印刷 / PDFで保存
    </button>
  </div>
</body>
</html>
  `;
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-[93%] max-w-[1080px] mx-auto py-32 pb-20">
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-slate-200 rounded mb-4" />
          <div className="h-5 w-96 bg-slate-100 rounded mb-12" />

          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-1/4">
              <div className="h-24 bg-slate-100 rounded-xl mb-6" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg" />
                ))}
              </div>
            </aside>
            <main className="lg:w-3/4 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
              ))}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          アクセスできません
        </h1>
        <p className="text-slate-500 mb-8">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} className="bg-vivid-blue hover:bg-vivid-blue/90">
            再試行
          </Button>
        )}
      </div>
    </div>
  );
}

// Token required state with email verification form
function TokenRequiredState() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // メールアドレスのバリデーション
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // メール送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setErrorMessage("有効なメールアドレスを入力してください");
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/mypage-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error ?? "エラーが発生しました");
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
    } catch {
      setErrorMessage("通信エラーが発生しました");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          マイページへのアクセス
        </h1>
        <p className="text-slate-500 mb-6">
          予約時にご登録いただいたメールアドレスを入力してください。<br />
          マイページへのアクセスリンクをお送りします。
        </p>

        {/* 成功メッセージ */}
        {submitStatus === "success" ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <p className="text-emerald-800 font-medium mb-2">
              メールを送信しました
            </p>
            <p className="text-emerald-600 text-sm">
              ご登録のメールアドレスにマイページへのアクセスリンクをお送りしました。
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </p>
          </div>
        ) : (
          /* メール入力フォーム */
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submitStatus === "error") {
                    setSubmitStatus("idle");
                    setErrorMessage("");
                  }
                }}
                placeholder="example@email.com"
                className={`w-full px-4 py-3 border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vivid-blue/50 focus:border-vivid-blue transition-colors ${
                  submitStatus === "error" ? "border-red-300" : "border-slate-200"
                }`}
                disabled={isSubmitting}
                required
              />
              {submitStatus === "error" && errorMessage && (
                <p className="text-red-500 text-sm mt-2 text-left">{errorMessage}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-vivid-blue hover:bg-vivid-blue/90 text-white py-3"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  送信中...
                </>
              ) : (
                "アクセスリンクを送信"
              )}
            </Button>
          </form>
        )}

        {/* ヘルプ情報 */}
        <div className="bg-slate-50 rounded-xl p-6 text-left">
          <p className="text-sm text-slate-600 mb-3">
            <strong>ご注意:</strong>
          </p>
          <ul className="text-sm text-slate-500 space-y-2">
            <li>* 予約時にご登録いただいたメールアドレスをご入力ください</li>
            <li>* メールが届くまで数分かかる場合があります</li>
            <li>* 迷惑メールフォルダもご確認ください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Reservation card component
function ReservationCard({
  reservation,
  onCancel,
  onDownloadReceipt,
  isPast,
}: {
  reservation: MypageReservationData;
  onCancel: (reservation: MypageReservationData) => void;
  onDownloadReceipt: (reservation: MypageReservationData) => void;
  isPast: boolean;
}) {
  const status = reservation.status ?? "pending";
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const paymentStatus = reservation.paymentStatus ?? "pending";
  const paymentConfig = PAYMENT_STATUS_CONFIG[paymentStatus] ?? PAYMENT_STATUS_CONFIG.pending;

  const canCancel = !isPast && status !== "cancelled" && status !== "completed";
  const canDownloadReceipt =
    paymentStatus === "paid" && (status === "confirmed" || status === "completed");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
        isPast ? "border-slate-100 opacity-80" : "border-slate-200 hover:border-vivid-blue/30 hover:shadow-lg"
      }`}
    >
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={statusConfig.variant} className="gap-1">
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
              <span className={`text-xs px-2 py-0.5 rounded-full ${paymentConfig.color}`}>
                {paymentConfig.label}
              </span>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900">
              {reservation.course?.title ?? "ヘリコプター遊覧飛行"}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-mono mb-1">
              {reservation.bookingNumber}
            </p>
            <p className="text-2xl font-bold text-vivid-blue">
              ¥{formatPrice(reservation.totalPrice)}
            </p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              搭乗日
            </p>
            <p className="text-sm font-bold text-slate-700">
              {formatDate(reservation.reservationDate)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Clock className="h-3 w-3" />
              出発時刻
            </p>
            <p className="text-sm font-bold text-slate-700">
              {formatTime(reservation.reservationTime)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Users className="h-3 w-3" />
              搭乗人数
            </p>
            <p className="text-sm font-bold text-slate-700">{reservation.pax}名</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Plane className="h-3 w-3" />
              フライト時間
            </p>
            <p className="text-sm font-bold text-slate-700">
              {reservation.course?.durationMinutes ?? "-"}分
            </p>
          </div>
        </div>

        {/* Heliport info */}
        {reservation.heliport && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
              <MapPin className="h-3 w-3" />
              集合場所
            </p>
            <p className="font-bold text-slate-900">{reservation.heliport.name}</p>
            <p className="text-sm text-slate-500">{reservation.heliport.address}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          {canDownloadReceipt && (
            <Button
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => onDownloadReceipt(reservation)}
            >
              <Receipt className="h-4 w-4 mr-2" />
              領収書
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => onCancel(reservation)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Cancellation dialog component
function CancellationDialog({
  state,
  onClose,
  onConfirm,
}: {
  state: CancellationState;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!state.reservation) return null;

  return (
    <Dialog open={state.isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {state.isSuccess ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                キャンセル完了
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                予約のキャンセル
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {state.isSuccess
              ? "ご予約のキャンセルが完了しました。"
              : `予約番号: ${state.reservation.bookingNumber}`}
          </DialogDescription>
        </DialogHeader>

        {state.isLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-vivid-blue" />
          </div>
        ) : state.isSuccess ? (
          <div className="py-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-emerald-700 font-medium">
                キャンセル処理が完了しました
              </p>
              {state.cancellationInfo && state.cancellationInfo.refundAmount > 0 && (
                <p className="text-sm text-emerald-600 mt-2">
                  返金額: ¥{formatPrice(state.cancellationInfo.refundAmount)}
                </p>
              )}
            </div>
          </div>
        ) : state.error ? (
          <div className="py-4">
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-red-700">{state.error}</p>
            </div>
          </div>
        ) : state.cancellationInfo ? (
          <div className="space-y-4">
            {/* Reservation summary */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="font-bold text-slate-900 mb-2">
                {state.reservation.course?.title}
              </p>
              <p className="text-sm text-slate-500">
                {formatDate(state.reservation.reservationDate)}{" "}
                {formatTime(state.reservation.reservationTime)}
              </p>
            </div>

            {/* Fee calculation */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <p className="text-sm font-bold text-slate-700">キャンセル料金</p>
                <p className="text-xs text-slate-500">
                  搭乗日まであと{state.cancellationInfo.daysUntil}日
                </p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">予約金額</span>
                  <span className="text-slate-900">
                    ¥{formatPrice(state.cancellationInfo.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    キャンセル料 ({state.cancellationInfo.feePercentage}%)
                  </span>
                  <span className="text-red-600 font-medium">
                    -¥{formatPrice(state.cancellationInfo.cancellationFee)}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">返金額</span>
                  <span className="font-bold text-emerald-600">
                    ¥{formatPrice(state.cancellationInfo.refundAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Policy info */}
            {state.policy.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-vivid-blue hover:underline">
                  キャンセルポリシーを確認
                </summary>
                <ul className="mt-2 space-y-1 text-slate-500 pl-4">
                  {state.policy.map((tier, i) => (
                    <li key={i}>{tier.description}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ) : null}

        <DialogFooter>
          {state.isSuccess ? (
            <Button onClick={onClose} className="w-full bg-vivid-blue hover:bg-vivid-blue/90">
              閉じる
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={state.isConfirming}>
                戻る
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirm}
                disabled={state.isConfirming || !!state.error || !state.cancellationInfo?.canCancel}
              >
                {state.isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    処理中...
                  </>
                ) : (
                  "キャンセルを確定"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mypageData, setMypageData] = useState<MypageData | null>(null);
  const [cancellationState, setCancellationState] = useState<CancellationState>({
    isOpen: false,
    isLoading: false,
    reservation: null,
    cancellationInfo: null,
    policy: [],
    error: null,
    isConfirming: false,
    isSuccess: false,
  });

  // Fetch mypage data
  const fetchMypageData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/auth/mypage-token?token=${encodeURIComponent(token)}&includeData=true`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "マイページデータの取得に失敗しました");
        return;
      }

      setMypageData(data.data);
    } catch (err) {
      console.error("Mypage fetch error:", err);
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMypageData();
  }, [fetchMypageData]);

  // Handle cancel button click
  const handleCancelClick = async (reservation: MypageReservationData) => {
    setCancellationState({
      isOpen: true,
      isLoading: true,
      reservation,
      cancellationInfo: null,
      policy: [],
      error: null,
      isConfirming: false,
      isSuccess: false,
    });

    try {
      const res = await fetch(
        `/api/public/reservations/${reservation.id}/cancel?token=${encodeURIComponent(token!)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setCancellationState((prev) => ({
          ...prev,
          isLoading: false,
          error: data.error ?? "キャンセル情報の取得に失敗しました",
        }));
        return;
      }

      setCancellationState((prev) => ({
        ...prev,
        isLoading: false,
        cancellationInfo: data.data.cancellation,
        policy: data.data.policy ?? [],
      }));
    } catch (err) {
      console.error("Cancel info fetch error:", err);
      setCancellationState((prev) => ({
        ...prev,
        isLoading: false,
        error: "通信エラーが発生しました",
      }));
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirm = async () => {
    if (!cancellationState.reservation || !token) return;

    setCancellationState((prev) => ({ ...prev, isConfirming: true }));

    try {
      const res = await fetch(
        `/api/public/reservations/${cancellationState.reservation.id}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setCancellationState((prev) => ({
          ...prev,
          isConfirming: false,
          error: data.error ?? "キャンセル処理に失敗しました",
        }));
        return;
      }

      setCancellationState((prev) => ({
        ...prev,
        isConfirming: false,
        isSuccess: true,
      }));

      // Refresh data after successful cancellation
      fetchMypageData();
    } catch (err) {
      console.error("Cancel confirm error:", err);
      setCancellationState((prev) => ({
        ...prev,
        isConfirming: false,
        error: "通信エラーが発生しました",
      }));
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setCancellationState({
      isOpen: false,
      isLoading: false,
      reservation: null,
      cancellationInfo: null,
      policy: [],
      error: null,
      isConfirming: false,
      isSuccess: false,
    });
  };

  // Handle receipt download
  const handleDownloadReceipt = (reservation: MypageReservationData) => {
    if (!mypageData?.customer) return;

    const receiptHTML = generateReceiptHTML(reservation, mypageData.customer);
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(receiptHTML);
      newWindow.document.close();
    }
  };

  // Render states
  if (!token) {
    return <TokenRequiredState />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMypageData} />;
  }

  if (!mypageData) {
    return <ErrorState message="データが見つかりませんでした" />;
  }

  const { customer, reservations } = mypageData;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingReservations = reservations.filter((r) => {
    const resDate = new Date(r.reservationDate);
    resDate.setHours(0, 0, 0, 0);
    return resDate >= today && r.status !== "cancelled" && r.status !== "completed";
  });

  const pastReservations = reservations.filter((r) => {
    const resDate = new Date(r.reservationDate);
    resDate.setHours(0, 0, 0, 0);
    return resDate < today || r.status === "cancelled" || r.status === "completed";
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="w-[93%] max-w-[1080px] mx-auto py-32 pb-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            マイページ
          </h1>
          <p className="text-slate-500 mt-2">
            ご予約内容の確認・変更が可能です
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar - Customer info */}
          <aside className="lg:w-1/4">
            <div className="sticky top-32 space-y-6">
              <div className="pb-6 border-b border-slate-100">
                <h2 className="font-bold text-xl text-slate-900">
                  {customer.name} 様
                </h2>
                <p className="text-sm text-slate-400 mt-1">{customer.email}</p>
                {customer.phone && (
                  <p className="text-sm text-slate-400">{customer.phone}</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    予約回数
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {customer.bookingCount ?? 0}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    累計金額
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    ¥{formatPrice(customer.totalSpent ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:w-3/4 space-y-12">
            <AnimatePresence mode="wait">
              {/* Upcoming reservations */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-vivid-blue" />
                  今後のフライト ({upcomingReservations.length})
                </h3>

                {upcomingReservations.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onCancel={handleCancelClick}
                        onDownloadReceipt={handleDownloadReceipt}
                        isPast={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-200">
                    <Plane className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium text-sm">
                      現在予定されているフライトはありません
                    </p>
                    <Button
                      variant="link"
                      className="text-vivid-blue mt-4"
                      onClick={() => (window.location.href = "/")}
                    >
                      新しいフライトを予約する
                    </Button>
                  </div>
                )}
              </section>

              {/* Past reservations */}
              {pastReservations.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    過去のフライト ({pastReservations.length})
                  </h3>

                  <div className="space-y-4">
                    {pastReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onCancel={handleCancelClick}
                        onDownloadReceipt={handleDownloadReceipt}
                        isPast={true}
                      />
                    ))}
                  </div>
                </section>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Cancellation dialog */}
      <CancellationDialog
        state={cancellationState}
        onClose={handleDialogClose}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
