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
  sort_order?: number | null;
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

const slots = [
  { value: "home_hero", label: "home_hero 首页主推荐" },
  { value: "home_featured", label: "home_featured 首页精选" },
  { value: "home_latest", label: "home_latest 最新推荐" },
  { value: "writing", label: "writing 作文推荐" },
  { value: "reading", label: "reading 阅读推荐" },
  { value: "teaching", label: "teaching 备课推荐" }
];

const statuses = [
  { value: "draft", label: "draft 草稿" },
  { value: "published", label: "published 发布" }
];

const visibilities = [
  { value: "public", label: "public 公开" },
  { value: "private", label: "private 私有" }
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="admin-button" type="submit" disabled={pending}>
      {pending ? "保存中……" : label}
    </button>
  );
}

export default function RecommendationForm({
  action,
  recommendation,
  submitLabel,
  cancelHref = "/admin/recommendations"
}: RecommendationFormProps) {
  const [state, formAction] = useFormState(action, { message: "" });

  return (
    <form action={formAction}>
      {state.message ? <p className="admin-alert">{state.message}</p> : null}

      <label>
        标题 title
        <input
          name="title"
          defaultValue={recommendation?.title ?? ""}
          placeholder="如：本周作文素材卡片墙"
          required
        />
      </label>

      <label>
        副标题 subtitle
        <input
          name="subtitle"
          defaultValue={recommendation?.subtitle ?? ""}
          placeholder="如：高考作文 · 人物素材 · 金句积累"
        />
      </label>

      <label>
        描述 description
        <textarea
          name="description"
          rows={5}
          defaultValue={recommendation?.description ?? ""}
          placeholder="用于首页推荐卡片展示的说明文字。"
        />
      </label>

      <div className="admin-form-row">
        <label>
          链接文案 link_text
          <input
            name="link_text"
            defaultValue={recommendation?.link_text ?? ""}
            placeholder="如：查看素材"
          />
        </label>

        <label>
          链接地址 link_url
          <input
            name="link_url"
            defaultValue={recommendation?.link_url ?? ""}
            placeholder="/pages/writing-cards-week20.html"
          />
        </label>
      </div>

      <div className="admin-form-row">
        <label>
          推荐位 slot
          <select name="slot" defaultValue={recommendation?.slot ?? "home_featured"} required>
            {slots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          排序 sort_order
          <input
            name="sort_order"
            type="number"
            defaultValue={recommendation?.sort_order ?? 0}
            step="1"
          />
        </label>
      </div>

      <div className="admin-form-row">
        <label>
          状态 status
          <select name="status" defaultValue={recommendation?.status ?? "draft"} required>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          可见性 visibility
          <select name="visibility" defaultValue={recommendation?.visibility ?? "public"} required>
            {visibilities.map((visibility) => (
              <option key={visibility.value} value={visibility.value}>
                {visibility.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="admin-checkbox">
        <input
          name="is_pinned"
          type="checkbox"
          defaultChecked={Boolean(recommendation?.is_pinned)}
        />
        是否置顶 is_pinned
      </label>

      <div className="admin-actions">
        <SubmitButton label={submitLabel} />
        <Link className="admin-button admin-button-secondary" href={cancelHref}>
          取消返回
        </Link>
      </div>

      <p className="admin-warning">
        请勿发布含学生姓名、成绩、排名、联系方式、班级隐私或未授权版权内容的推荐。
      </p>
    </form>
  );
}
