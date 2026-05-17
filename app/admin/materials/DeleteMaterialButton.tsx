"use client";

import { deleteMaterialAction } from "./actions";

type DeleteMaterialButtonProps = {
  id: string;
};

export default function DeleteMaterialButton({ id }: DeleteMaterialButtonProps) {
  const deleteMaterial = deleteMaterialAction.bind(null, id);

  return (
    <form
      action={deleteMaterial}
      onSubmit={(event) => {
        if (!confirm("确定要删除这张素材卡片吗？此操作不可恢复。")) {
          event.preventDefault();
        }
      }}
    >
      <button className="admin-link-button" type="submit">
        删除
      </button>
    </form>
  );
}
