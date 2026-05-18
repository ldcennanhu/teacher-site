import RecommendationForm from "../RecommendationForm";
import { createRecommendationAction } from "../actions";

export default function NewRecommendationPage() {
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
