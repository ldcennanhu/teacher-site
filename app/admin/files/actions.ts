"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export type FileFormState = {
  message: string;
};

const bucketName = "teaching-files";

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

function formatDatePath(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sanitizeFileName(fileName: string) {
  const sanitized = fileName
    .normalize("NFKC")
    .replace(/[\\/]/g, "-")
    .replace(/[^\w.\-\u4e00-\u9fa5]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "file";
}

export async function uploadTeachingFileAction(
  _previousState: FileFormState,
  formData: FormData
): Promise<FileFormState> {
  const supabase = createClient();

  if (!supabase) {
    return { message: "缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。" };
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { message: userError?.message ?? "请先登录后再上传备课文件。" };
  }

  const title = getString(formData, "title");
  const fileType = getString(formData, "file_type");
  const file = formData.get("file");

  if (!title) {
    return { message: "请填写文件标题。" };
  }

  if (!fileType) {
    return { message: "请选择文件类型。" };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { message: "请选择要上传的文件。" };
  }

  const now = new Date();
  const safeFileName = sanitizeFileName(file.name);
  const filePath = `${user.id}/${formatDatePath(now)}/${now.getTime()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, {
    contentType: file.type || undefined,
    upsert: false
  });

  if (uploadError) {
    return { message: uploadError.message };
  }

  const { error: insertError } = await supabase.from("teaching_files").insert({
    title,
    author_id: user.id,
    file_path: filePath,
    file_url: filePath,
    file_type: fileType,
    category: getString(formData, "category") || null,
    grade: getString(formData, "grade") || null,
    textbook: getString(formData, "textbook") || null,
    unit_name: getString(formData, "unit_name") || null,
    lesson_type: getString(formData, "lesson_type") || null,
    summary: getString(formData, "summary") || null,
    tags: parseTags(getString(formData, "tags")),
    is_public_for_students: formData.get("is_public_for_students") === "on",
    updated_at: now.toISOString()
  });

  if (insertError) {
    await supabase.storage.from(bucketName).remove([filePath]);
    return { message: insertError.message };
  }

  redirect("/admin/files");
}

export async function deleteTeachingFileAction(formData: FormData) {
  const supabase = createClient();

  if (!supabase) {
    throw new Error("缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。");
  }

  const id = getString(formData, "id");

  if (!id) {
    throw new Error("缺少备课文件 id。");
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? "请先登录后再删除备课文件。");
  }

  const { data: file, error: fileError } = await supabase
    .from("teaching_files")
    .select("file_path")
    .eq("id", id)
    .eq("author_id", user.id)
    .single<{ file_path: string | null }>();

  if (fileError || !file?.file_path) {
    throw new Error("未找到可删除的备课文件。");
  }

  const { error: storageError } = await supabase.storage.from(bucketName).remove([file.file_path]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: deleteError } = await supabase
    .from("teaching_files")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath("/admin/files");
}
