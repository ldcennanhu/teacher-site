import { redirect } from "next/navigation";
import FileForm from "../FileForm";
import { uploadTeachingFileAction } from "../actions";
import { createClient } from "../../../../lib/supabase/server";

import AdminNav from "../../AdminNav";
export default async function NewTeachingFilePage() {
  const supabase = createClient();

  if (!supabase) {
    return (
      <main className="admin-shell">
        <AdminNav />
        <section className="admin-card">
          <p className="muted">Admin / Files / New</p>
          <h1>上传备课文件</h1>
          <p>缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。</p>
        </section>
      </main>
    );
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return (
    <main className="admin-shell">
      <AdminNav />
      <section className="admin-card">
        <p className="muted">Admin / Files / New</p>
        <h1>上传备课文件</h1>
        <FileForm action={uploadTeachingFileAction} />
      </section>
    </main>
  );
}
