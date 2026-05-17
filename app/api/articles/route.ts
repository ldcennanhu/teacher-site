import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type ArticleRow = {
  title: string | null;
  slug: string | null;
  section: string | null;
  category: string | null;
  summary: string | null;
  tags: string[] | null;
  updated_at: string | null;
  published_at: string | null;
};

function normalizeArticle(article: ArticleRow) {
  return {
    title: article.title ?? "",
    section: article.section ?? "",
    category: article.category ?? "",
    summary: article.summary ?? "",
    tags: Array.isArray(article.tags) ? article.tags : [],
    date: article.published_at ?? article.updated_at ?? "",
    url: `/articles/${article.section}/${article.slug}`
  };
}

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section")?.trim();
  const supabase = createClient();

  if (!supabase) {
    return NextResponse.json([]);
  }

  try {
    let query = supabase
      .from("articles")
     .select("title,slug,section,category,summary,tags,updated_at,published_at")
      .eq("status", "published")
      .eq("visibility", "public")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (section) {
      query = query.eq("section", section);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json([]);
    }

    return NextResponse.json(((data ?? []) as ArticleRow[]).map(normalizeArticle));
  } catch {
    return NextResponse.json([]);
  }
}
