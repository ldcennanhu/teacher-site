import Link from "next/link";

export default function AdminUnauthorizedPage() {
  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">Admin / Unauthorized</p>
        <h1>无权访问后台</h1>
        <p>
          当前登录账号不在后台管理员白名单中。如需访问内容管理后台，请联系站点管理员将你的
          Supabase 登录邮箱或用户 ID 加入白名单环境变量。
        </p>

        <div className="admin-actions">
          <Link className="admin-button" href="/admin/login">
            返回登录
          </Link>
          <a className="admin-button admin-button-secondary" href="/index.html">
            打开首页
          </a>
        </div>
      </section>
    </main>
  );
}
