import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type PublicTeachingFileRow = {
  id: string;
  title: string | null;
  file_type: string | null;
  category: string | null;
  grade: string | null;
  textbook: string | null;
  unit_name: string | null;
  lesson_type: string | null;
  summary: string | null;
  tags: string[] | null;
  updated_at: string | null;
};

function normalizeStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizePublicFile(file: PublicTeachingFileRow) {
  return {
    id: file.id,
    title: file.title ?? "",
    file_type: file.file_type ?? "",
    category: file.category ?? "",
    grade: file.grade ?? "",
    textbook: file.textbook ?? "",
    unit_name: file.unit_name ?? "",
    lesson_type: file.lesson_type ?? "",
    summary: file.summary ?? "",
    tags: normalizeStringList(file.tags),
    updated_at: file.updated_at
  };
}

export async function GET() {
  const supabase = createClient();

  if (!supabase) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await supabase
      .from("teaching_files")
      .select("id,title,file_type,category,grade,textbook,unit_name,lesson_type,summary,tags,updated_at")
      .eq("is_public_for_students", true)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json([]);
    }

    return NextResponse.json(((data ?? []) as PublicTeachingFileRow[]).map(normalizePublicFile));
  } catch {
    return NextResponse.json([]);
  }
}
