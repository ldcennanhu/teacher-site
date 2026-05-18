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
