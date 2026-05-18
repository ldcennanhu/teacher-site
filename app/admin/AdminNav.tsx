import Link from "next/link";

const adminLinks = [
  { href: "/admin", label: "后台首页" },
  { href: "/admin/articles", label: "文章管理" },
  { href: "/admin/materials", label: "素材卡片" },
  { href: "/admin/files", label: "备课文件" },
  { href: "/admin/recommendations", label: "首页推荐" }
];

export default function AdminNav() {
  return (
    <nav className="admin-card" aria-label="后台导航" style={{ marginBottom: 18, padding: 18 }}>
      <div className="admin-actions">
        {adminLinks.map((link) => (
          <Link className="admin-button admin-button-secondary" href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
        <a className="admin-button admin-button-secondary" href="/index.html">
          站点预览
        </a>
      </div>
    </nav>
  );
}
