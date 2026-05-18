"use client";

import { deleteRecommendationAction } from "./actions";

type DeleteRecommendationButtonProps = {
  id: string;
};

export default function DeleteRecommendationButton({ id }: DeleteRecommendationButtonProps) {
  const deleteRecommendation = deleteRecommendationAction.bind(null, id);

  return (
    <form
      action={deleteRecommendation}
      onSubmit={(event) => {
        if (!confirm("确定要删除这条首页推荐吗？此操作不可恢复。")) {
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
