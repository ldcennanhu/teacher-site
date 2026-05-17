"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import type { FileFormState } from "./actions";

const fileTypes = ["PPT", "Word", "PDF", "学案", "练习题", "答案解析", "图片", "其他"];

type FileFormProps = {
  action: (previousState: FileFormState, formData: FormData) => Promise<FileFormState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="admin-button" type="submit" disabled={pending}>
      {pending ? "上传中……" : "保存文件"}
    </button>
  );
}

export default function FileForm({ action }: FileFormProps) {
  const [state, formAction] = useFormState(action, { message: "" });

  return (
    <form action={formAction}>
      {state.message ? <p className="admin-alert">{state.message}</p> : null}

      <label>
        文件标题 title
        <input name="title" required />
      </label>

      <label>
        文件 file
        <input name="file" type="file" required />
      </label>

      <div className="admin-form-row">
        <label>
          文件类型 file_type
          <select name="file_type" defaultValue="PDF" required>
            {fileTypes.map((fileType) => (
              <option key={fileType} value={fileType}>
                {fileType}
              </option>
            ))}
          </select>
        </label>

        <label>
          所属栏目 category
          <input name="category" placeholder="如：备课资源" />
        </label>
      </div>

      <div className="admin-form-row">
        <label>
          年级 grade
          <input name="grade" placeholder="如：高一" />
        </label>

        <label>
          教材版本 textbook
          <input name="textbook" placeholder="如：统编版必修上册" />
        </label>
      </div>

      <div className="admin-form-row">
        <label>
          单元 unit_name
          <input name="unit_name" />
        </label>

        <label>
          课型 lesson_type
          <input name="lesson_type" placeholder="如：新授课 / 复习课 / 讲评课" />
        </label>
      </div>

      <label>
        简介 summary
        <textarea name="summary" rows={4} />
      </label>

      <label>
        标签 tags（用逗号分隔）
        <input name="tags" placeholder="课件, 学案, 高一" />
      </label>

      <label className="admin-checkbox">
        <input name="is_public_for_students" type="checkbox" />
        是否公开给学生 is_public_for_students
      </label>

      <div className="admin-actions">
        <SubmitButton />
        <Link className="admin-button admin-button-secondary" href="/admin/files">
          取消返回
        </Link>
      </div>

      <p className="admin-warning">
        请勿上传含学生姓名、成绩、排名、联系方式、班级隐私或未授权版权内容的资料。
      </p>
    </form>
  );
}
