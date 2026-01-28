"use client";
import { ReservationsView } from "@/app/components/admin/ReservationsView";
export default function Page() { return <ReservationsView currentUser={{ id: "admin-1", name: "Admin", role: "admin", email: "", avatar: "" }} />; }
