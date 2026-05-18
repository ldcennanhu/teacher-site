"use client";

import { deleteRecommendationAction } from "./actions";

type DeleteRecommendationButtonProps = {
  id: string;
};

export default function DeleteRecommendationButton({ id }: DeleteRecommendationButtonProps) {
  return (
    <form
      action={deleteRecommendationAction}
      onSubmit={(event) => {
        if (!window.confirm("确定要删除这条首页推荐吗？此操作不可恢复。")) {
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
