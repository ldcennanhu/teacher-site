import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import DeleteRecommendationButton from "./DeleteRecommendationButton";

type Recommendation = {
  id: string;
  title: string | null;
  subtitle: string | null;
  slot: string | null;
  status: string | null;
  visibility: string | null;
  is_pinned: boolean | null;
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
  const supabase = createClient();
  let recommendations: Recommendation[] = [];
  let message = "配置 Supabase 后会从 home_recommendations 表读取当前登录用户的首页推荐。";

  if (supabase) {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      message = userError?.message ?? "请先登录后再管理首页推荐。";
    } else {
      const { data, error } = await supabase
        .from("home_recommendations")
        .select("id,title,subtitle,slot,status,visibility,is_pinned,sort_order,updated_at")
        .eq("author_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) {
        message = error.message;
      } else {
        recommendations = data ?? [];
        message = recommendations.length
          ? "按置顶、排序值和更新时间显示当前登录用户创建的首页推荐。"
          : "暂无首页推荐，请先新建。";
      }
    }
  }

  return (
    <main className="admin-shell">
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
                  <th>副标题 subtitle</th>
                  <th>推荐位 slot</th>
                  <th>状态 status</th>
                  <th>可见性 visibility</th>
                  <th>置顶 is_pinned</th>
                  <th>排序 sort_order</th>
                  <th>更新时间 updated_at</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((recommendation) => (
                  <tr key={recommendation.id}>
                    <td>{recommendation.title ?? "未命名"}</td>
                    <td>{recommendation.subtitle ?? "-"}</td>
                    <td>{recommendation.slot ?? "-"}</td>
                    <td>{recommendation.status ?? "draft"}</td>
                    <td>{recommendation.visibility ?? "public"}</td>
                    <td>{recommendation.is_pinned ? "是" : "否"}</td>
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
