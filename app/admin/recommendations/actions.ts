"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export type RecommendationFormState = {
  message: string;
};

const defaultStatus = "draft";
const defaultVisibility = "public";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

function buildRecommendationPayload(formData: FormData, userId?: string) {
  const status = getString(formData, "status") || defaultStatus;
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    title: getString(formData, "title"),
    subtitle: getString(formData, "subtitle") || null,
    description: getString(formData, "description") || null,
    link_text: getString(formData, "link_text") || null,
    link_url: getString(formData, "link_url") || null,
    slot: getString(formData, "slot"),
    status,
    visibility: getString(formData, "visibility") || defaultVisibility,
    is_pinned: formData.get("is_pinned") === "on",
    sort_order: getNumber(formData, "sort_order"),
    updated_at: now
  };

  if (userId) {
    payload.author_id = userId;
  }

  return { payload, status, now };
}

function validateRecommendationPayload(payload: Record<string, unknown>) {
  if (!payload.title) {
    return "请填写推荐标题。";
  }

  if (!payload.slot) {
    return "请选择推荐位。";
  }

  return null;
}

export async function createRecommendationAction(
  _previousState: RecommendationFormState,
  formData: FormData
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
      message: userError?.message ?? "请先登录后再新建首页推荐。"
    };
  }

  const { payload, status, now } = buildRecommendationPayload(formData, user.id);
  const validationMessage = validateRecommendationPayload(payload);

  if (validationMessage) {
    return { message: validationMessage };
  }

  if (status === "published") {
    payload.published_at = now;
  }

  const { error } = await supabase.from("home_recommendations").insert(payload);

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/admin/recommendations");
  redirect("/admin/recommendations");
}

export async function updateRecommendationAction(
  id: string,
  _previousState: RecommendationFormState,
  formData: FormData
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
      message: userError?.message ?? "请先登录后再编辑首页推荐。"
    };
  }

  const { data: existingRecommendation, error: existingError } = await supabase
    .from("home_recommendations")
    .select("id,author_id,published_at")
    .eq("id", id)
    .eq("author_id", user.id)
    .single<{ id: string; author_id: string | null; published_at: string | null }>();

  if (existingError || !existingRecommendation) {
    return {
      message: "未找到可编辑的首页推荐，或当前账号没有管理权限。"
    };
  }

  const { payload, status, now } = buildRecommendationPayload(formData);
  const validationMessage = validateRecommendationPayload(payload);

  if (validationMessage) {
    return { message: validationMessage };
  }

  if (status === "published" && !existingRecommendation.published_at) {
    payload.published_at = now;
  }

  if (status !== "published") {
    payload.published_at = null;
  }

  const { error } = await supabase
    .from("home_recommendations")
    .update(payload)
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/admin/recommendations");
  revalidatePath(`/admin/recommendations/${id}/edit`);
  redirect("/admin/recommendations");
}

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
