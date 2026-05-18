import { redirect } from "next/navigation";
import RecommendationForm from "../RecommendationForm";
import { createRecommendationAction } from "../actions";
import { createClient } from "../../../../lib/supabase/server";

export default async function NewRecommendationPage() {
  const supabase = createClient();

  if (!supabase) {
    return (
      <main className="admin-shell">
        <section className="admin-card">
          <p className="muted">Admin / Recommendations / New</p>
          <h1>新建首页推荐</h1>
          <p>缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。</p>
        </section>
      </main>
    );
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">Admin / Recommendations / New</p>
        <h1>新建首页推荐</h1>
        <RecommendationForm action={createRecommendationAction} submitLabel="保存推荐" />
      </section>
    </main>
  );
}
