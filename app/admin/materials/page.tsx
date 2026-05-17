import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { deleteMaterialAction } from "./actions";

type Material = {
  id: string;
  title: string | null;
  topic: string | null;
  status: string | null;
  is_pinned: boolean | null;
  visibility: string | null;
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
  const supabase = createClient();
  let materials: Material[] = [];
  let message = "配置 Supabase 后会从 materials 表读取当前登录用户的素材卡片。";

  if (supabase) {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      message = userError?.message ?? "请先登录后再管理素材卡片。";
    } else {
      const { data, error } = await supabase
        .from("materials")
        .select("id,title,topic,status,is_pinned,visibility,updated_at")
        .eq("author_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        message = error.message;
      } else {
        materials = data ?? [];
        message = materials.length
          ? "按更新时间倒序显示当前登录用户创建的素材卡片。"
          : "暂无素材卡片，请先新建。";
      }
    }
  }

  return (
    <main className="admin-shell">
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

                        <form action={deleteMaterialAction}>
                          <input name="id" type="hidden" value={material.id} />
                          <button className="admin-link-button" type="submit">
                            删除
                          </button>
                        </form>
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
