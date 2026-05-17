"use client";

import { deleteArticleAction } from "./actions";

type DeleteArticleButtonProps = {
  id: string;
};

export default function DeleteArticleButton({ id }: DeleteArticleButtonProps) {
  const deleteArticle = deleteArticleAction.bind(null, id);

  return (
    <form
      action={deleteArticle}
      onSubmit={(event) => {
        if (!confirm("确定要删除这篇文章吗？此操作不可恢复。")) {
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
