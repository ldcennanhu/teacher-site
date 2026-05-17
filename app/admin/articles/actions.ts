"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export type ArticleFormState = {
  message: string;
};

const defaultVisibility = "public";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildArticlePayload(formData: FormData, userId?: string) {
  const status = getString(formData, "status") || "draft";
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    section: getString(formData, "section"),
    category: getString(formData, "category") || null,
    summary: getString(formData, "summary") || null,
    tags: parseTags(getString(formData, "tags")),
    content: getString(formData, "content"),
    status,
    is_pinned: formData.get("is_pinned") === "on",
    visibility: getString(formData, "visibility") || defaultVisibility,
    updated_at: now
  };

  if (userId) {
    payload.author_id = userId;
  }

  return { payload, status, now };
}

function validateArticlePayload(payload: Record<string, unknown>) {
  if (!payload.title) {
    return "请填写标题。";
  }

  if (!payload.slug) {
    return "请填写文章路径。";
  }

  if (!payload.section) {
    return "请选择栏目。";
  }

  if (!payload.content) {
    return "请填写正文。";
  }

  return null;
}

export async function createArticleAction(
  _previousState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
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
      message: userError?.message ?? "请先登录后再新建文章。"
    };
  }

  const { payload, status, now } = buildArticlePayload(formData, user.id);
  const validationMessage = validateArticlePayload(payload);

  if (validationMessage) {
    return { message: validationMessage };
  }

  if (status === "published") {
    payload.published_at = now;
  }

  const { error } = await supabase.from("articles").insert(payload);

  if (error) {
    return { message: error.message };
  }

  redirect("/admin/articles");
}

export async function updateArticleAction(
  id: string,
  _previousState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const supabase = createClient();

  if (!supabase) {
    return {
      message: "缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。"
    };
  }

  const { data: existingArticle, error: existingError } = await supabase
    .from("articles")
    .select("published_at,status")
    .eq("id", id)
    .single();

  if (existingError) {
    return { message: existingError.message };
  }

  const { payload, status, now } = buildArticlePayload(formData);
  const validationMessage = validateArticlePayload(payload);

  if (validationMessage) {
    return { message: validationMessage };
  }

  if (status === "published" && !existingArticle?.published_at) {
    payload.published_at = now;
  }

  const { error } = await supabase.from("articles").update(payload).eq("id", id);

  if (error) {
    return { message: error.message };
  }

  redirect("/admin/articles");
}
