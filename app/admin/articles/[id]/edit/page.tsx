import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleForm, { type ArticleFormValues } from "../../ArticleForm";
import { updateArticleAction } from "../../actions";
import { createClient } from "../../../../../lib/supabase/server";

type EditArticlePageProps = {
  params: {
    id: string;
  };
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const supabase = createClient();

  if (!supabase) {
    return (
      <main className="admin-shell">
        <section className="admin-card">
          <p className="muted">Admin / Articles / Edit</p>
          <h1>编辑文章</h1>
          <p>缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。</p>
          <Link className="admin-button admin-button-secondary" href="/admin/articles">
            取消返回
          </Link>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("articles")
    .select("title,slug,section,category,summary,tags,content,status,is_pinned,visibility")
    .eq("id", params.id)
    .single<ArticleFormValues>();

  if (error || !data) {
    notFound();
  }

  const updateAction = updateArticleAction.bind(null, params.id);

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">Admin / Articles / Edit</p>
        <h1>编辑文章</h1>
        <ArticleForm article={data} action={updateAction} submitLabel="保存修改" />
      </section>
    </main>
  );
}
