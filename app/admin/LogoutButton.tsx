"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button className="admin-button admin-button-secondary" type="button" onClick={handleLogout}>
      退出登录
    </button>
  );
}
