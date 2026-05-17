import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

type TeachingFile = {
  id: string;
  title: string | null;
  file_type: string | null;
  category: string | null;
  grade: string | null;
  textbook: string | null;
  is_public_for_students: boolean | null;
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

export default async function AdminFilesPage() {
  const supabase = createClient();

  if (!supabase) {
    return (
      <main className="admin-shell">
        <section className="admin-card">
          <p className="muted">Admin / Files</p>
          <h1>备课文件</h1>
          <p>缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。</p>
        </section>
      </main>
    );
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("teaching_files")
    .select("id,title,file_type,category,grade,textbook,is_public_for_students,updated_at")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  const files = (data ?? []) as TeachingFile[];
  const message = error ? error.message : files.length ? "按更新时间倒序显示当前账号上传的备课文件。" : "暂无备课文件，请先上传";

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <div className="admin-heading-row">
          <div>
            <p className="muted">Admin / Files</p>
            <h1>备课文件</h1>
          </div>
          <Link className="admin-button" href="/admin/files/new">
            上传文件
          </Link>
        </div>

        <p>{message}</p>

        {files.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>文件标题 title</th>
                  <th>文件类型 file_type</th>
                  <th>所属栏目 category</th>
                  <th>年级 grade</th>
                  <th>教材 textbook</th>
                  <th>公开给学生</th>
                  <th>更新时间 updated_at</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>{file.title ?? "未命名"}</td>
                    <td>{file.file_type ?? "-"}</td>
                    <td>{file.category ?? "-"}</td>
                    <td>{file.grade ?? "-"}</td>
                    <td>{file.textbook ?? "-"}</td>
                    <td>{file.is_public_for_students ? "是" : "否"}</td>
                    <td>{formatDate(file.updated_at)}</td>
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
