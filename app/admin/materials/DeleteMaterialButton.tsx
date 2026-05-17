"use client";

import { deleteMaterialAction } from "./actions";

type DeleteMaterialButtonProps = {
  id: string;
};

export default function DeleteMaterialButton({ id }: DeleteMaterialButtonProps) {
  return (
    <form
      action={deleteMaterialAction}
      onSubmit={(event) => {
        if (!window.confirm("确定要删除这张素材卡片吗？此操作不可恢复。")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="admin-link-button" type="submit">
        删除
      </button>
    </form>
  );
}
