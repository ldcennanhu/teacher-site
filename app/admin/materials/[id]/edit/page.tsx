import Link from "next/link";
import { notFound } from "next/navigation";
import AdminNav from "../../../AdminNav";
import MaterialForm, { type MaterialFormValues } from "../../MaterialForm";
import { updateMaterialAction } from "../../actions";
import { requireAdminUser } from "../../../../../lib/admin/auth";

type EditMaterialPageProps = {
  params: {
    id: string;
  };
};

export default async function EditMaterialPage({ params }: EditMaterialPageProps) {
  const { supabase, user } = await requireAdminUser();

  const { data, error } = await supabase
    .from("materials")
    .select(
      "title,topic,summary,tags,points,main_quote,life,quotes,topics,expand,year,week,status,is_pinned,visibility"
    )
    .eq("id", params.id)
    .eq("author_id", user.id)
    .single<MaterialFormValues>();

  if (error || !data) {
    notFound();
  }

  const updateAction = updateMaterialAction.bind(null, params.id);

  return (
    <main className="admin-shell">
      <AdminNav />

      <section className="admin-card">
        <p className="muted">Admin / Materials / Edit</p>
        <h1>编辑素材卡片</h1>
        <MaterialForm material={data} action={updateAction} submitLabel="保存修改" />
        <div className="admin-actions">
          <Link className="admin-button admin-button-secondary" href="/admin/materials">
            返回素材列表
          </Link>
        </div>
      </section>
    </main>
  );
}
