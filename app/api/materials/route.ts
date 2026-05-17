import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type MaterialRow = {
  id: string;
  title: string | null;
  topic: string | null;
  summary: string | null;
  tags: string[] | null;
  points: string[] | null;
  main_quote: string | null;
  life: string | null;
  quotes: string[] | null;
  topics: string[] | null;
  expand: string | null;
  updated_at: string | null;
  published_at: string | null;
};

function normalizeStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeMaterial(material: MaterialRow) {
  return {
    id: material.id,
    title: material.title ?? "",
    topic: material.topic ?? "",
    summary: material.summary ?? "",
    tags: normalizeStringList(material.tags),
    points: normalizeStringList(material.points),
    main_quote: material.main_quote ?? "",
    life: material.life ?? "",
    quotes: normalizeStringList(material.quotes),
    topics: normalizeStringList(material.topics),
    expand: material.expand ?? "",
    updated_at: material.updated_at,
    published_at: material.published_at
  };
}

export async function GET() {
  const supabase = createClient();

  if (!supabase) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await supabase
      .from("materials")
      .select(
        "id,title,topic,summary,tags,points,main_quote,life,quotes,topics,expand,updated_at,published_at"
      )
      .eq("status", "published")
      .eq("visibility", "public")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json([]);
    }

    return NextResponse.json(((data ?? []) as MaterialRow[]).map(normalizeMaterial));
  } catch {
    return NextResponse.json([]);
  }
}
