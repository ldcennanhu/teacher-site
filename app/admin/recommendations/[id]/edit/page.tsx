import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import RecommendationForm, { type RecommendationFormValues } from "../../RecommendationForm";
import { updateRecommendationAction } from "../../actions";
import { createClient } from "../../../../../lib/supabase/server";

type EditRecommendationPageProps = {
  params: {
    id: string;
  };
};

export default async function EditRecommendationPage({ params }: EditRecommendationPageProps) {
  const supabase = createClient();

  if (!supabase) {
    return (
      <main className="admin-shell">
        <section className="admin-card">
          <p className="muted">Admin / Recommendations / Edit</p>
          <h1>编辑首页推荐</h1>
          <p>缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。</p>
          <Link className="admin-button admin-button-secondary" href="/admin/recommendations">
            取消返回
          </Link>
        </section>
      </main>
    );
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("home_recommendations")
    .select("title,subtitle,description,link_text,link_url,slot,status,visibility,is_pinned")
    .eq("id", params.id)
    .eq("author_id", user.id)
    .single<RecommendationFormValues>();

  if (error || !data) {
    notFound();
  }

  const updateAction = updateRecommendationAction.bind(null, params.id);

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">Admin / Recommendations / Edit</p>
        <h1>编辑首页推荐</h1>
        <RecommendationForm recommendation={data} action={updateAction} submitLabel="保存修改" />
      </section>
    </main>
  );
}
