"use client";

import { deleteTeachingFileAction } from "./actions";

type DeleteFileButtonProps = {
  fileId: string;
};

export default function DeleteFileButton({ fileId }: DeleteFileButtonProps) {
  return (
    <form
      action={deleteTeachingFileAction}
      onSubmit={(event) => {
        if (!window.confirm("确定要删除这个备课文件吗？此操作不可恢复。")) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={fileId} />
      <button className="admin-link-button admin-danger-button" type="submit">
        删除
      </button>
    </form>
  );
}
