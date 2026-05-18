import FileForm from "../FileForm";
import { uploadTeachingFileAction } from "../actions";
import { requireAdminUser } from "../../../../lib/admin/auth";

export default async function NewTeachingFilePage() {
  await requireAdminUser();

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">Admin / Files / New</p>
        <h1>上传备课文件</h1>
        <FileForm action={uploadTeachingFileAction} />
      </section>
    </main>
  );
}
