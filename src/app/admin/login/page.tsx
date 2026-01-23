"use client";

import { LoginView } from "@/components/admin/views";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLogin = (role: 'admin' | 'staff') => {
    // TODO: Implement actual authentication
    console.log("Logged in as:", role);
    router.push("/admin/dashboard");
  };

  return <LoginView onLogin={handleLogin} />;
}
