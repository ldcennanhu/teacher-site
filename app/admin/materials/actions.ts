"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export type MaterialFormState = {
  message: string;
};

const defaultVisibility = "private";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLineList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildMaterialPayload(formData: FormData, userId?: string) {
  const status = getString(formData, "status") || "draft";
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    title: getString(formData, "title"),
    topic: getString(formData, "topic"),
    summary: getString(formData, "summary"),
    tags: parseCommaList(getString(formData, "tags")),
    points: parseLineList(getString(formData, "points")),
    main_quote: getString(formData, "main_quote"),
    life: getString(formData, "life"),
    quotes: parseLineList(getString(formData, "quotes")),
    topics: parseLineList(getString(formData, "topics")),
    expand: getString(formData, "expand") || null,
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
    return "请填写人物生平或素材详情。";
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

  revalidatePath("/admin/materials");
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
    .select("published_at,status")
    .eq("id", id)
    .eq("author_id", user.id)
    .single<{ published_at: string | null; status: string | null }>();

  if (existingError || !existingMaterial) {
    return {
      message: "未找到可编辑的素材卡片，或当前账号没有管理权限。"
    };
  }

  const { payload, status, now } = buildMaterialPayload(formData);
  const validationMessage = validateMaterialPayload(payload);

  if (validationMessage) {
    return { message: validationMessage };
  }

  if (status === "published" && !existingMaterial.published_at) {
    payload.published_at = now;
  }

  if (status !== "published") {
    payload.published_at = null;
  }

  const { error } = await supabase
    .from("materials")
    .update(payload)
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/admin/materials");
  revalidatePath(`/admin/materials/${id}/edit`);
  redirect("/admin/materials");
}

export async function deleteMaterialAction(formData: FormData) {
  const supabase = createClient();

  if (!supabase) {
    throw new Error("缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。");
  }

  const id = getString(formData, "id");

  if (!id) {
    throw new Error("缺少素材卡片 id。");
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? "请先登录后再删除素材卡片。");
  }

  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/materials");
}
