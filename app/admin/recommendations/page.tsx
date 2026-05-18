import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

type HomeRecommendation = {
  id: string;
  title: string | null;
  slot: string | null;
  status: string | null;
  visibility: string | null;
  is_pinned: boolean | null;
  updated_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AdminRecommendationsPage() {
  const supabase = createClient();

  if (!supabase) {
    return (
      <main className="admin-shell">
        <section className="admin-card">
          <p className="muted">Admin / Recommendations</p>
          <h1>首页推荐</h1>
          <p>缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。</p>
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
    .select("id,title,slot,status,visibility,is_pinned,updated_at")
    .eq("author_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  const recommendations = (data ?? []) as HomeRecommendation[];
  const message = error
    ? error.message
    : recommendations.length
      ? "按置顶和更新时间显示当前账号创建的首页推荐。"
      : "暂无首页推荐，请先新建";

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <div className="admin-heading-row">
          <div>
            <p className="muted">Admin / Recommendations</p>
            <h1>首页推荐</h1>
          </div>
          <Link className="admin-button" href="/admin/recommendations/new">
            新建推荐
          </Link>
        </div>

        <p>{message}</p>

        {recommendations.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题 title</th>
                  <th>推荐位置 slot</th>
                  <th>状态 status</th>
                  <th>可见性 visibility</th>
                  <th>置顶 is_pinned</th>
                  <th>更新时间 updated_at</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((recommendation) => (
                  <tr key={recommendation.id}>
                    <td>{recommendation.title ?? "未命名"}</td>
                    <td>{recommendation.slot ?? "-"}</td>
                    <td>{recommendation.status ?? "draft"}</td>
                    <td>{recommendation.visibility ?? "private"}</td>
                    <td>{recommendation.is_pinned ? "是" : "否"}</td>
                    <td>{formatDate(recommendation.updated_at)}</td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          className="admin-link-button"
                          href={`/admin/recommendations/${recommendation.id}/edit`}
                        >
                          编辑
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
