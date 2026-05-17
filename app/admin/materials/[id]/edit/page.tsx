import Link from "next/link";
import { notFound } from "next/navigation";
import MaterialForm, { type MaterialFormValues } from "../../MaterialForm";
import { updateMaterialAction } from "../../actions";
import { createClient } from "../../../../../lib/supabase/server";

type EditMaterialPageProps = {
  params: {
    id: string;
  };
};

export default async function EditMaterialPage({ params }: EditMaterialPageProps) {
  const supabase = createClient();

  if (!supabase) {
    return (
      <main className="admin-shell">
        <section className="admin-card">
          <p className="muted">Admin / Materials / Edit</p>
          <h1>编辑素材卡片</h1>
          <p>缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。</p>
          <Link className="admin-button admin-button-secondary" href="/admin/materials">
            取消返回
          </Link>
        </section>
      </main>
    );
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <main className="admin-shell">
        <section className="admin-card">
          <p className="muted">Admin / Materials / Edit</p>
          <h1>编辑素材卡片</h1>
          <p>{userError?.message ?? "请先登录后再编辑素材卡片。"}</p>
          <Link className="admin-button admin-button-secondary" href="/admin/materials">
            取消返回
          </Link>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("materials")
    .select(
      "title,topic,summary,tags,points,main_quote,life,quotes,topics,expand,status,is_pinned,visibility"
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
      <section className="admin-card">
        <p className="muted">Admin / Materials / Edit</p>
        <h1>编辑素材卡片</h1>
        <MaterialForm material={data} action={updateAction} submitLabel="保存修改" />
      </section>
    </main>
  );
}
