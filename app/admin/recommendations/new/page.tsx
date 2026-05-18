import Link from "next/link";
import { requireAdminUser } from "../../../../lib/admin/auth";

export default async function NewRecommendationPage() {
  await requireAdminUser();

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">Admin / Recommendations / New</p>
        <h1>新建推荐内容</h1>
        <p>
          推荐内容表单尚未接入。当前页面已纳入后台管理员白名单保护，后续可以继续补充推荐内容的表单和
          server action。
        </p>

        <Link className="admin-button admin-button-secondary" href="/admin/recommendations">
          返回推荐内容
        </Link>
      </section>
    </main>
  );
}
