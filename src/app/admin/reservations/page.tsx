"use client";

import { ReservationsView } from "@/components/admin/views";
import { User } from "@/lib/data/types";

// TODO: Get current user from auth context
const mockCurrentUser: User = {
  id: "admin-1",
  name: "System Admin",
  role: "admin",
  email: "admin@privatesky.jp",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export default function ReservationsPage() {
  return <ReservationsView currentUser={mockCurrentUser} />;
}
