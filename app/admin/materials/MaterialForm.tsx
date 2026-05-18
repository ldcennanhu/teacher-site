"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { MaterialFormState } from "./actions";

export type MaterialFormValues = {
  title?: string | null;
  topic?: string | null;
  summary?: string | null;
  tags?: string[] | null;
  points?: string[] | null;
  main_quote?: string | null;
  life?: string | null;
  quotes?: string[] | null;
  topics?: string[] | null;
  expand?: string | null;
  year?: number | null;
  week?: number | null;
  status?: string | null;
  is_pinned?: boolean | null;
  visibility?: string | null;
};

type MaterialFormProps = {
  action: (previousState: MaterialFormState, formData: FormData) => Promise<MaterialFormState>;
  material?: MaterialFormValues;
  submitLabel: string;
  cancelHref?: string;
};

const statuses = [
  { value: "draft", label: "draft 草稿" },
  { value: "published", label: "published 发布" }
];

function listToText(items?: string[] | null) {
  return (items ?? []).join("\n");
}

function currentWeekNumber(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((Number(date) - Number(firstDay)) / 86400000);
  return Math.max(1, Math.ceil((dayOffset + firstDay.getDay() + 1) / 7));
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="admin-button" type="submit" disabled={pending}>
      {pending ? "保存中……" : label}
    </button>
  );
}

export default function MaterialForm({
  action,
  material,
  submitLabel,
  cancelHref = "/admin/materials"
}: MaterialFormProps) {
  const [state, formAction] = useFormState(action, { message: "" });

  const tagText = useMemo(() => {
    return (material?.tags ?? []).join(", ");
  }, [material?.tags]);

  const pointsText = useMemo(() => {
    return listToText(material?.points);
  }, [material?.points]);

  const quotesText = useMemo(() => {
    return listToText(material?.quotes);
  }, [material?.quotes]);

  const topicsText = useMemo(() => {
    return listToText(material?.topics);
  }, [material?.topics]);

  return (
    <form action={formAction}>
      {state.message ? <p className="admin-alert">{state.message}</p> : null}

      <div className="admin-form-row">
        <label>
          年份 year
          <input
            name="year"
            type="number"
            min="2020"
            max="2100"
            defaultValue={material?.year ?? new Date().getFullYear()}
            placeholder="如：2026"
            required
          />
        </label>

        <label>
          周次 week
          <input
            name="week"
            type="number"
            min="1"
            max="53"
            defaultValue={material?.week ?? currentWeekNumber()}
            placeholder="如：21"
            required
          />
        </label>
      </div>

      <label>
        标题 title
        <input
          name="title"
          defaultValue={material?.title ?? ""}
          placeholder="如：钱七虎：把个人理想融入家国命运"
          required
        />
      </label>

      <label>
        卡片主题 topic
        <input
          name="topic"
          defaultValue={material?.topic ?? ""}
          placeholder="如：01 / 家国民族"
          required
        />
      </label>

      <label>
        概述 summary
        <textarea
          name="summary"
          rows={4}
          defaultValue={material?.summary ?? ""}
          placeholder="用于卡片列表展示的简短概述。"
          required
        />
      </label>

      <label>
        标签 tags（用逗号分隔）
        <input
          name="tags"
          defaultValue={tagText}
          placeholder="家国情怀, 科技报国, 青年担当"
        />
      </label>

      <label>
        写作角度 points（每行一条）
        <textarea
          name="points"
          rows={5}
          defaultValue={pointsText}
          placeholder={"个人价值与国家前途同频共振。\n硬核创新背后需要理想信念支撑。"}
        />
      </label>

      <label>
        核心金句 main_quote
        <textarea
          name="main_quote"
          rows={3}
          defaultValue={material?.main_quote ?? ""}
          placeholder="个人理想汇入国家需要，生命才抵达更辽阔的高度。"
          required
        />
      </label>

      <label>
        人物生平 / 素材详情 life
        <textarea
          name="life"
          rows={7}
          defaultValue={material?.life ?? ""}
          placeholder="详情弹窗中的主体素材说明。"
          required
        />
      </label>

      <label>
        更多金句 quotes（每行一条）
        <textarea
          name="quotes"
          rows={5}
          defaultValue={quotesText}
          placeholder={"把个人理想系于国家前途，人生才能抵达更辽阔的高度。\n真正的担当，不在口号里，而在长期沉默的坚守中。"}
        />
      </label>

      <label>
        适用话题 topics（每行一条）
        <textarea
          name="topics"
          rows={5}
          defaultValue={topicsText}
          placeholder={"家国情怀\n科技报国\n使命担当\n青年理想"}
        />
      </label>

      <label>
        同主题拓展素材 expand
        <textarea
          name="expand"
          rows={5}
          defaultValue={material?.expand ?? ""}
          placeholder="可同主题拓展邓稼先、黄旭华、南仁东等素材。"
        />
      </label>

      <div className="admin-form-row">
        <label>
          状态 status
          <select name="status" defaultValue={material?.status ?? "draft"} required>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          可见性 visibility
          <input name="visibility" defaultValue={material?.visibility ?? "private"} />
        </label>
      </div>

      <label className="admin-checkbox">
        <input
          name="is_pinned"
          type="checkbox"
          defaultChecked={Boolean(material?.is_pinned)}
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
        请勿上传或发布含学生姓名、成绩、排名、联系方式、班级隐私或未授权版权内容的资料。
      </p>
    </form>
  );
}
