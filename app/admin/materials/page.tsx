import Link from "next/link";
import DeleteMaterialButton from "./DeleteMaterialButton";
import AdminNav from "../AdminNav";
import { requireAdminUser } from "../../../lib/admin/auth";

type Material = {
  id: string;
  title: string | null;
  topic: string | null;
  year: number | null;
  week: number | null;
  status: string | null;
  visibility: string | null;
  is_pinned: boolean | null;
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

export default async function AdminMaterialsPage() {
  const { supabase, user } = await requireAdminUser();

  const { data, error } = await supabase
    .from("materials")
    .select("id,title,topic,year,week,status,visibility,is_pinned,updated_at")
    .eq("author_id", user.id)
    .order("year", { ascending: false })
    .order("week", { ascending: false })
    .order("updated_at", { ascending: false });

  const materials = (data ?? []) as Material[];
  const message = error
    ? error.message
    : materials.length
      ? "按年份、周次和更新时间显示当前登录用户创建的素材卡片。"
      : "暂无素材卡片，请先新建。";

  return (
    <main className="admin-shell">
      <AdminNav />

      <section className="admin-card">
        <div className="admin-heading-row">
          <div>
            <p className="muted">Admin / Materials</p>
            <h1>素材卡片墙管理</h1>
          </div>

          <Link className="admin-button" href="/admin/materials/new">
            新建素材卡片
          </Link>
        </div>

        <p>{message}</p>

        {materials.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题 title</th>
                  <th>年份 year</th>
                  <th>周次 week</th>
                  <th>主题 topic</th>
                  <th>状态 status</th>
                  <th>可见性 visibility</th>
                  <th>置顶 is_pinned</th>
                  <th>更新时间 updated_at</th>
                  <th>操作</th>
                </tr>
              </thead>

              <tbody>
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td>{material.title ?? "未命名"}</td>
                    <td>{material.year ?? "-"}</td>
                    <td>{material.week ?? "-"}</td>
                    <td>{material.topic ?? "-"}</td>
                    <td>{material.status ?? "draft"}</td>
                    <td>{material.visibility ?? "private"}</td>
                    <td>{material.is_pinned ? "是" : "否"}</td>
                    <td>{formatDate(material.updated_at)}</td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          className="admin-link-button"
                          href={`/admin/materials/${material.id}/edit`}
                        >
                          编辑
                        </Link>
                        <DeleteMaterialButton id={material.id} />
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
