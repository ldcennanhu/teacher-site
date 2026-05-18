import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { requireAdminUser } from "../../lib/admin/auth";
import { createClient } from "../../lib/supabase/server";

type AdminStats = {
  articleTotal: number;
  publishedArticles: number;
  draftArticles: number;
  materialTotal: number;
  teachingFileTotal: number;
};

const emptyStats: AdminStats = {
  articleTotal: 0,
  publishedArticles: 0,
  draftArticles: 0,
  materialTotal: 0,
  teachingFileTotal: 0
};

type SupabaseClient = NonNullable<ReturnType<typeof createClient>>;

async function countUserRows(
  supabase: SupabaseClient,
  table: "articles" | "materials" | "teaching_files",
  userId: string,
  status?: "published" | "draft"
) {
  try {
    let query = supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId);

    if (status) {
      query = query.eq("status", status);
    }

    const { count, error } = await query;

    if (error) {
      return 0;
    }

    return count ?? 0;
  } catch {
    return 0;
  }
}

async function getAdminStats(supabase: SupabaseClient | null, userId?: string) {
  if (!supabase || !userId) {
    return emptyStats;
  }

  const [articleTotal, publishedArticles, draftArticles, materialTotal, teachingFileTotal] =
    await Promise.all([
      countUserRows(supabase, "articles", userId),
      countUserRows(supabase, "articles", userId, "published"),
      countUserRows(supabase, "articles", userId, "draft"),
      countUserRows(supabase, "materials", userId),
      countUserRows(supabase, "teaching_files", userId)
    ]);

  return {
    articleTotal,
    publishedArticles,
    draftArticles,
    materialTotal,
    teachingFileTotal
  };
}

export default async function AdminHomePage() {
  const { supabase, user } = await requireAdminUser();
  const stats = await getAdminStats(supabase, user.id);

  const statCards = [
    { label: "文章总数", value: stats.articleTotal },
    { label: "已发布文章数", value: stats.publishedArticles },
    { label: "草稿文章数", value: stats.draftArticles },
    { label: "素材卡片数", value: stats.materialTotal },
    { label: "备课文件数", value: stats.teachingFileTotal }
  ];

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">孤登塔客语文馆</p>
        <h1>内容管理后台</h1>

        <p className="muted">当前登录：{user.email ?? user.id}</p>

        <div className="admin-actions">
          <LogoutButton />
        </div>

        <div className="admin-stats" aria-label="后台数据统计">
          {statCards.map((stat) => (
            <article className="admin-stat-card" key={stat.label}>
              <strong className="admin-stat-number">{stat.value}</strong>
              <span className="admin-stat-label">{stat.label}</span>
            </article>
          ))}
        </div>

        <div className="admin-grid">
          <article className="admin-card">
            <h2>文章管理</h2>
            <p>新建、编辑、发布教学文章，内容可同步到栏目页、首页最新更新和搜索页。</p>
            <Link className="admin-button" href="/admin/articles">
              进入文章
            </Link>
          </article>

          <article className="admin-card">
            <h2>素材卡片</h2>
            <p>管理每周作文素材卡、人物素材、主题素材和金句。</p>
            <Link className="admin-button" href="/admin/materials">
              进入素材
            </Link>
          </article>

          <article className="admin-card">
            <h2>备课文件</h2>
            <p>上传和管理 PPT、PDF、Word、学案、练习题等备课资料。</p>
            <Link className="admin-button" href="/admin/files">
              进入文件
            </Link>
          </article>

          <article className="admin-card">
            <h2>首页推荐</h2>
            <p>管理首页重点推荐内容、金句、入口按钮和展示文案。</p>
            <Link className="admin-button" href="/admin/recommendations">
              进入推荐
            </Link>
          </article>

          <article className="admin-card">
            <h2>站点预览</h2>
            <p>查看正式前台页面，确认发布内容展示效果。</p>
            <a className="admin-button" href="/index.html">
              打开首页
            </a>
          </article>
        </div>

        <p className="admin-warning">
          发布前请确认：不包含学生姓名、成绩、排名、联系方式、班级隐私或未授权版权内容。
        </p>
      </section>
    </main>
  );
}
