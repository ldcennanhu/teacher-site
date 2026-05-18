import Link from "next/link";
import DeleteRecommendationButton from "./DeleteRecommendationButton";
import AdminNav from "../AdminNav";
import { requireAdminUser } from "../../../lib/admin/auth";

type Recommendation = {
  id: string;
  title: string | null;
  status: string | null;
  sort_order: number | null;
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
  const { supabase, user } = await requireAdminUser();

  const { data, error } = await supabase
    .from("home_recommendations")
    .select("id,title,status,sort_order,updated_at")
    .eq("author_id", user.id)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  const recommendations = (data ?? []) as Recommendation[];
  const message = error
    ? error.message
    : recommendations.length
      ? "按排序值和更新时间显示当前账号创建的首页推荐。"
      : "暂无首页推荐，请先新建。";

  return (
    <main className="admin-shell">
      <AdminNav />

      <section className="admin-card">
        <div className="admin-heading-row">
          <div>
            <p className="muted">Admin / Recommendations</p>
            <h1>首页推荐管理</h1>
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
                  <th>状态 status</th>
                  <th>排序 sort_order</th>
                  <th>更新时间 updated_at</th>
                  <th>操作</th>
                </tr>
              </thead>

              <tbody>
                {recommendations.map((recommendation) => (
                  <tr key={recommendation.id}>
                    <td>{recommendation.title ?? "未命名"}</td>
                    <td>{recommendation.status ?? "draft"}</td>
                    <td>{recommendation.sort_order ?? 0}</td>
                    <td>{formatDate(recommendation.updated_at)}</td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          className="admin-link-button"
                          href={`/admin/recommendations/${recommendation.id}/edit`}
                        >
                          编辑
                        </Link>
                        <DeleteRecommendationButton id={recommendation.id} />
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
