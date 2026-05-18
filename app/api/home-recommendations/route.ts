import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type HomeRecommendationRow = {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  link_text: string | null;
  link_url: string | null;
  slot: string | null;
  is_pinned: boolean | null;
  updated_at: string | null;
  published_at: string | null;
};

function normalizeRecommendation(recommendation: HomeRecommendationRow) {
  return {
    id: recommendation.id,
    title: recommendation.title ?? "",
    subtitle: recommendation.subtitle ?? "",
    description: recommendation.description ?? "",
    link_text: recommendation.link_text ?? "",
    link_url: recommendation.link_url ?? "",
    slot: recommendation.slot ?? "",
    is_pinned: Boolean(recommendation.is_pinned),
    updated_at: recommendation.updated_at,
    published_at: recommendation.published_at
  };
}

export async function GET() {
  const supabase = createClient();

  if (!supabase) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await supabase
      .from("home_recommendations")
      .select("id,title,subtitle,description,link_text,link_url,slot,is_pinned,updated_at,published_at")
      .eq("status", "published")
      .eq("visibility", "public")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json([]);
    }

    return NextResponse.json(((data ?? []) as HomeRecommendationRow[]).map(normalizeRecommendation));
  } catch {
    return NextResponse.json([]);
  }
}
