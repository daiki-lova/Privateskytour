import Link from "next/link";
import { XCircle, ArrowLeft, Phone, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "決済エラー | PRIVATESKY",
  description: "決済処理中にエラーが発生しました。",
};

export default function BookingErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Error Icon */}
        <div className="text-center space-y-6 mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900">
              決済処理中にエラーが発生しました
            </h1>
            <p className="text-slate-500">
              お手数ですが、もう一度お試しいただくか、
              <br />
              下記までお問い合わせください。
            </p>
          </div>
        </div>

        {/* Error Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">考えられる原因</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <span>クレジットカード情報の入力ミス</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <span>カードの利用限度額超過</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <span>ネットワーク接続の問題</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">-</span>
                <span>セッションのタイムアウト</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full bg-vivid-blue hover:bg-vivid-blue/90 h-12">
            <Link href="/booking">
              <RefreshCw className="w-4 h-4 mr-2" />
              もう一度予約する
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full h-12">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              トップページへ戻る
            </Link>
          </Button>
        </div>

        {/* Contact Info */}
        <Card className="mt-8 bg-slate-100 border-0">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">お問い合わせ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-vivid-blue" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">メール</p>
                  <a
                    href="mailto:info@privatesky.co.jp"
                    className="text-vivid-blue font-medium hover:underline"
                  >
                    info@privatesky.co.jp
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-vivid-blue" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">電話</p>
                  <a
                    href="tel:03-1234-5678"
                    className="text-vivid-blue font-medium hover:underline"
                  >
                    03-1234-5678
                  </a>
                </div>
              </div>
              <p className="text-slate-500 text-xs pt-2">
                営業時間: 平日 10:00 - 18:00
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
