import type { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";

export type AdminProfile = {
  user_id: string;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
};

export type AdminAuthState = {
  user: User | null;
  profile: AdminProfile | null;
  isAdmin: boolean;
};

export async function getAdminAuth(): Promise<AdminAuthState> {
  const supabase = createClient();

  if (!supabase) {
    return {
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
      user: null,
      profile: null,
      isAdmin: false
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("user_id,email,role,is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle<AdminProfile>();

  return {
    user,
    profile: profileError ? null : profile,
    isAdmin: Boolean(!profileError && profile?.is_active)
  };
}
