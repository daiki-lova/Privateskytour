"use client";

import { ReservationsView } from "@/components/admin/views";
import { useAuth } from "@/components/providers/AuthProvider";
import type { User } from "@/lib/data/types";

export default function ReservationsPage() {
  const { user } = useAuth();

  // AuthProvider から取得したユーザー情報を User 型に変換
  const currentUser: User | null = user
    ? {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatar: user.avatarUrl ?? "",
      }
    : null;

  // ユーザー情報がない場合はローディング表示（AuthProvider で認証済みのはず）
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <ReservationsView currentUser={currentUser} />;
}
