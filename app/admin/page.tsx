import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">孤登塔客语文馆</p>
        <h1>内容管理后台</h1>

        <p className="muted">
          {data.user
            ? `当前登录：${data.user.email ?? data.user.id}`
            : "Supabase 环境变量配置后即可启用登录保护。"}
        </p>

        <div className="admin-grid">
          <article className="admin-card">
            <h2>文章管理</h2>
            <p>查看后续接入 Supabase 的文章数据入口。</p>
            <Link className="admin-button" href="/admin/articles">
              进入文章
            </Link>
          </article>

          <article className="admin-card">
            <h2>站点预览</h2>
            <p>保留原静态内容生成流程，便于继续发布教学资料。</p>
            <a className="admin-button" href="/index.html">
              打开首页
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
