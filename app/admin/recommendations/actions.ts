"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export type RecommendationFormState = {
  message: string;
};

const defaultStatus = "draft";
const defaultVisibility = "public";
const slots = new Set(["hero", "quote", "feature"]);
const statuses = new Set(["draft", "published"]);
const visibilities = new Set(["public", "private"]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeChoice(value: string, allowed: Set<string>, fallback: string) {
  return allowed.has(value) ? value : fallback;
}

function buildRecommendationPayload(formData: FormData, userId?: string) {
  const status = normalizeChoice(getString(formData, "status"), statuses, defaultStatus);
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    title: getString(formData, "title"),
    subtitle: getString(formData, "subtitle") || null,
    description: getString(formData, "description") || null,
    link_text: getString(formData, "link_text") || null,
    link_url: getString(formData, "link_url") || null,
    slot: normalizeChoice(getString(formData, "slot"), slots, "hero"),
    status,
    visibility: normalizeChoice(getString(formData, "visibility"), visibilities, defaultVisibility),
    is_pinned: formData.get("is_pinned") === "on",
    updated_at: now
  };

  if (userId) {
    payload.author_id = userId;
  }

  return { payload, status, now };
}

function validateRecommendationPayload(payload: Record<string, unknown>) {
  if (!payload.title) {
    return "请填写标题。";
  }

  if (!payload.slot) {
    return "请选择推荐位置。";
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
    .select("id,author_id,published_at,status")
    .eq("id", id)
    .eq("author_id", user.id)
    .single<{
      id: string;
      author_id: string | null;
      published_at: string | null;
      status: string | null;
    }>();

  if (existingError || !existingRecommendation) {
    return { message: existingError?.message ?? "找不到首页推荐，或你没有权限编辑。" };
  }

  if (existingRecommendation.author_id !== user.id) {
    return { message: "你只能编辑自己创建的首页推荐。" };
  }

  const { payload, status, now } = buildRecommendationPayload(formData);
  const validationMessage = validateRecommendationPayload(payload);

  if (validationMessage) {
    return { message: validationMessage };
  }

  if (status === "published" && !existingRecommendation.published_at) {
    payload.published_at = now;
  }

  const { error } = await supabase
    .from("home_recommendations")
    .update(payload)
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    return { message: error.message };
  }

  redirect("/admin/recommendations");
}

export async function deleteRecommendationAction(formData: FormData): Promise<void> {
  const supabase = createClient();

  if (!supabase) {
    return;
  }

  const id = getString(formData, "id");

  if (!id) {
    return;
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return;
  }

  const { data: existingRecommendation } = await supabase
    .from("home_recommendations")
    .select("id,author_id")
    .eq("id", id)
    .eq("author_id", user.id)
    .single<{
      id: string;
      author_id: string | null;
    }>();

  if (!existingRecommendation || existingRecommendation.author_id !== user.id) {
    return;
  }

  await supabase
    .from("home_recommendations")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  revalidatePath("/admin/recommendations");
}
