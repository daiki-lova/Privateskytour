"use client";

import { MyPage } from "../MyPage";
import { useRouter } from "../../lib/next-mock";

export default function MyPagePage() {
  const router = useRouter();
  
  const handleLogout = () => {
    // In a real app, this would call an API
    router.push('/');
  };

  return <MyPage onLogout={handleLogout} />;
}
