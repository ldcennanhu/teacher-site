import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export type AdminProfile = {
  id: string;
  user_id: string;
  email: string;
  role: string | null;
  is_active: boolean | null;
};

export async function getAdminAuth() {
  const supabase = createClient();

  if (!supabase) {
    return {
      supabase: null,
      user: null,
      profile: null,
      isAdmin: false
    };
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      profile: null,
      isAdmin: false
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id,user_id,email,role,is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle<AdminProfile>();

  if (profileError || !profile) {
    return {
      supabase,
      user,
      profile: null,
      isAdmin: false
    };
  }

  return {
    supabase,
    user,
    profile,
    isAdmin: true
  };
}

export async function requireAdminUser() {
  const auth = await getAdminAuth();

  if (!auth.user) {
    redirect("/admin/login");
  }

  if (!auth.isAdmin) {
    redirect("/admin/unauthorized");
  }

  return {
    supabase: auth.supabase,
    user: auth.user,
    profile: auth.profile
  };
}
