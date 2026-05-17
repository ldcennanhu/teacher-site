"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

export type MaterialFormState = {
  message: string;
};

export async function deleteMaterialAction(id: string): Promise<MaterialFormState> {
  const supabase = createClient();

  if (!supabase) {
    return {
      message: "缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。"
    };
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      message: userError?.message ?? "请先登录后再删除素材卡片。"
    };
  }

  const { data: material, error: materialError } = await supabase
    .from("materials")
    .select("id,author_id")
    .eq("id", id)
    .single<{ id: string; author_id: string | null }>();

  if (materialError || !material) {
    return { message: "找不到素材卡片，或你没有权限删除这张素材卡片。" };
  }

  if (material.author_id !== user.id) {
    return { message: "你只能删除自己的素材卡片。" };
  }

  const { error: deleteError } = await supabase
    .from("materials")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (deleteError) {
    return { message: deleteError.message };
  }

  revalidatePath("/admin/materials");

  return { message: "素材卡片已删除。" };
}
