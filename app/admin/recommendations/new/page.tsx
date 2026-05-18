import RecommendationForm from "../RecommendationForm";
import { createRecommendationAction } from "../actions";
import AdminNav from "../../AdminNav";
import { requireAdminUser } from "../../../../lib/admin/auth";

export default async function NewRecommendationPage() {
  await requireAdminUser();

  return (
    <main className="admin-shell">
      <AdminNav />

      <section className="admin-card">
        <p className="muted">Admin / Recommendations / New</p>
        <h1>新建首页推荐</h1>
        <RecommendationForm action={createRecommendationAction} submitLabel="保存推荐" />
      </section>
    </main>
  );
}
