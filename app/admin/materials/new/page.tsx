import MaterialForm from "../MaterialForm";
import { createMaterialAction } from "../actions";
import { requireAdminUser } from "../../../../lib/admin/auth";

export default async function NewMaterialPage() {
  await requireAdminUser();

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">Admin / Materials / New</p>
        <h1>新建素材卡片</h1>
        <MaterialForm action={createMaterialAction} submitLabel="保存素材卡片" />
      </section>
    </main>
  );
}
