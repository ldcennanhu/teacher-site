"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

export type RecommendationFormState = {
  message: string;
};

export async function deleteRecommendationAction(
  id: string
): Promise<RecommendationFormState> {
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
      message: userError?.message ?? "请先登录后再删除首页推荐。"
    };
  }

  const { data: recommendation, error: recommendationError } = await supabase
    .from("home_recommendations")
    .select("id,author_id")
    .eq("id", id)
    .single<{ id: string; author_id: string | null }>();

  if (recommendationError || !recommendation) {
    return { message: "找不到首页推荐，或你没有权限删除这条推荐。" };
  }

  if (recommendation.author_id !== user.id) {
    return { message: "你只能删除自己创建的首页推荐。" };
  }

  const { error: deleteError } = await supabase
    .from("home_recommendations")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (deleteError) {
    return { message: deleteError.message };
  }

  revalidatePath("/admin/recommendations");

  return { message: "首页推荐已删除。" };
}
