"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export type MaterialFormState = {
  message: string;
};

const defaultVisibility = "public";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string, fallback: number) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function parseList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function currentWeekNumber(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((Number(date) - Number(firstDay)) / 86400000);
  return Math.max(1, Math.ceil((dayOffset + firstDay.getDay() + 1) / 7));
}

function buildMaterialPayload(formData: FormData, userId?: string) {
  const now = new Date().toISOString();
  const status = getString(formData, "status") || "draft";

  const payload: Record<string, unknown> = {
    title: getString(formData, "title"),
    topic: getString(formData, "topic") || null,
    summary: getString(formData, "summary") || null,
    year: getNumber(formData, "year", new Date().getFullYear()),
    week: getNumber(formData, "week", currentWeekNumber()),
    tags: parseList(getString(formData, "tags")),
    points: parseList(getString(formData, "points")),
    quotes: parseList(getString(formData, "quotes")),
    topics: parseList(getString(formData, "topics")),
    main_quote: getString(formData, "main_quote") || null,
    life: getString(formData, "life") || null,
    expand: getString(formData, "expand") || null,
    status,
    visibility: getString(formData, "visibility") || defaultVisibility,
    is_pinned: formData.get("is_pinned") === "on",
    updated_at: now
  };

  if (userId) {
    payload.author_id = userId;
  }

  return { payload, status, now };
}

function validateMaterialPayload(payload: Record<string, unknown>) {
  if (!payload.title) {
    return "请填写素材标题。";
  }

  if (!payload.topic) {
    return "请填写卡片主题。";
  }

  if (!payload.summary) {
    return "请填写素材概述。";
  }

  if (!payload.main_quote) {
    return "请填写核心金句。";
  }

  if (!payload.life) {
    return "请填写人物生平 / 素材详情。";
  }

  return null;
}

export async function createMaterialAction(
  _previousState: MaterialFormState,
  formData: FormData
): Promise<MaterialFormState> {
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
      message: userError?.message ?? "请先登录后再新建素材卡片。"
    };
  }

  const { payload, status, now } = buildMaterialPayload(formData, user.id);
  const validationMessage = validateMaterialPayload(payload);

  if (validationMessage) {
    return { message: validationMessage };
  }

  if (status === "published") {
    payload.published_at = now;
  }

  const { error } = await supabase.from("materials").insert(payload);

  if (error) {
    return { message: error.message };
  }

  redirect("/admin/materials");
}

export async function updateMaterialAction(
  id: string,
  _previousState: MaterialFormState,
  formData: FormData
): Promise<MaterialFormState> {
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
      message: userError?.message ?? "请先登录后再编辑素材卡片。"
    };
  }

  const { data: existingMaterial, error: existingError } = await supabase
    .from("materials")
    .select("id,author_id,published_at,status")
    .eq("id", id)
    .single<{
      id: string;
      author_id: string | null;
      published_at: string | null;
      status: string | null;
    }>();

  if (existingError || !existingMaterial) {
    return { message: existingError?.message ?? "找不到这张素材卡片。" };
  }

  if (existingMaterial.author_id !== user.id) {
    return { message: "你只能编辑自己创建的素材卡片。" };
  }

  const { payload, status, now } = buildMaterialPayload(formData);
  const validationMessage = validateMaterialPayload(payload);

  if (validationMessage) {
    return { message: validationMessage };
  }

  if (status === "published" && !existingMaterial.published_at) {
    payload.published_at = now;
  }

  const { error } = await supabase
    .from("materials")
    .update(payload)
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    return { message: error.message };
  }

  redirect("/admin/materials");
}

export async function deleteMaterialAction(formData: FormData): Promise<void> {
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

  const { data: existingMaterial } = await supabase
    .from("materials")
    .select("id,author_id")
    .eq("id", id)
    .single<{
      id: string;
      author_id: string | null;
    }>();

  if (!existingMaterial || existingMaterial.author_id !== user.id) {
    return;
  }

  await supabase
    .from("materials")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  revalidatePath("/admin/materials");
}
