"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import type { RecommendationFormState } from "./actions";

export type RecommendationFormValues = {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  link_text?: string | null;
  link_url?: string | null;
  slot?: string | null;
  status?: string | null;
  visibility?: string | null;
  is_pinned?: boolean | null;
};

type RecommendationFormProps = {
  action: (
    previousState: RecommendationFormState,
    formData: FormData
  ) => Promise<RecommendationFormState>;
  recommendation?: RecommendationFormValues;
  submitLabel: string;
  cancelHref?: string;
};

const slotOptions = [
  { value: "hero", label: "hero 首页主推荐" },
  { value: "quote", label: "quote 本周作文金句" },
  { value: "feature", label: "feature 首页功能推荐" }
];

const statusOptions = [
  { value: "draft", label: "draft 草稿" },
  { value: "published", label: "published 已发布" }
];

const visibilityOptions = [
  { value: "public", label: "public 公开" },
  { value: "private", label: "private 私密" }
];

const initialState: RecommendationFormState = { message: "" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="admin-button" type="submit" disabled={pending}>
      {pending ? "保存中..." : label}
    </button>
  );
}

export default function RecommendationForm({
  action,
  recommendation,
  submitLabel,
  cancelHref = "/admin/recommendations"
}: RecommendationFormProps) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction}>
      {state.message ? <p className="admin-alert">{state.message}</p> : null}

      <label>
        标题 title
        <input name="title" defaultValue={recommendation?.title ?? ""} required />
      </label>

      <label>
        副标题 subtitle
        <input name="subtitle" defaultValue={recommendation?.subtitle ?? ""} />
      </label>

      <label>
        描述 description
        <textarea name="description" rows={5} defaultValue={recommendation?.description ?? ""} />
      </label>

      <div className="admin-form-row">
        <label>
          按钮文字 link_text
          <input name="link_text" defaultValue={recommendation?.link_text ?? ""} />
        </label>

        <label>
          按钮链接 link_url
          <input name="link_url" defaultValue={recommendation?.link_url ?? ""} placeholder="zuowen.html" />
        </label>
      </div>

      <div className="admin-form-row">
        <label>
          推荐位置 slot
          <select name="slot" defaultValue={recommendation?.slot ?? "hero"} required>
            {slotOptions.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          状态 status
          <select name="status" defaultValue={recommendation?.status ?? "draft"} required>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          可见性 visibility
          <select name="visibility" defaultValue={recommendation?.visibility ?? "public"} required>
            {visibilityOptions.map((visibility) => (
              <option key={visibility.value} value={visibility.value}>
                {visibility.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="admin-checkbox">
        <input name="is_pinned" type="checkbox" defaultChecked={Boolean(recommendation?.is_pinned)} />
        是否置顶 is_pinned
      </label>

      <div className="admin-actions">
        <SubmitButton label={submitLabel} />
        <Link className="admin-button admin-button-secondary" href={cancelHref}>
          取消返回
        </Link>
      </div>

      <p className="admin-warning">
        首页推荐发布后会出现在前台首页。请确认不包含学生隐私、未授权版权内容或无效链接。
      </p>
    </form>
  );
}
