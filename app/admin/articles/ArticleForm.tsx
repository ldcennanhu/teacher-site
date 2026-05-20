"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { ArticleFormState } from "./actions";

export type ArticleFormValues = {
  title?: string | null;
  slug?: string | null;
  section?: string | null;
  category?: string | null;
  summary?: string | null;
  tags?: string[] | null;
  content?: string | null;
  status?: string | null;
  is_pinned?: boolean | null;
  visibility?: string | null;
};

type ArticleFormProps = {
  action: (previousState: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  article?: ArticleFormValues;
  submitLabel: string;
  cancelHref?: string;
};

const sections = [
  { value: "zuowen", label: "zuowen 作文专区" },
  { value: "wenyan", label: "wenyan 文言文研习" },
  { value: "shici", label: "shici 诗词曲赋" },
  { value: "yuedu", label: "yuedu 现代文阅读" },
  { value: "mingzhu", label: "mingzhu 名著导读" },
  { value: "beike", label: "beike 备课资源" }
];

const statuses = [
  { value: "draft", label: "draft 草稿" },
  { value: "published", label: "published 发布" }
];

function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function removeUnsafeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\S+/gi, "")
    .replace(/javascript:/gi, "");
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="admin-button" type="submit" disabled={pending}>
      {pending ? "保存中……" : label}
    </button>
  );
}

export default function ArticleForm({
  action,
  article,
  submitLabel,
  cancelHref = "/admin/articles"
}: ArticleFormProps) {
  const [state, formAction] = useFormState(action, { message: "" });
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(article?.slug));
  const [content, setContent] = useState(article?.content ?? "");

  const tagText = useMemo(() => {
    return (article?.tags ?? []).join(", ");
  }, [article?.tags]);

  useEffect(() => {
    if (!isSlugManuallyEdited) {
      setSlug(slugifyTitle(title));
    }
  }, [isSlugManuallyEdited, title]);

  const previewHtml = useMemo(() => removeUnsafeHtml(content), [content]);

  return (
    <form action={formAction}>
      {state.message ? <p className="admin-alert">{state.message}</p> : null}

      <label>
        标题 title
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>

      <label>
        文章路径 slug
        <input
          name="slug"
          value={slug}
          onChange={(event) => {
            setIsSlugManuallyEdited(true);
            setSlug(event.target.value);
          }}
          required
        />
      </label>

      <label>
        栏目 section
        <select name="section" defaultValue={article?.section ?? "zuowen"} required>
          {sections.map((section) => (
            <option key={section.value} value={section.value}>
              {section.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        分类 category
        <input name="category" defaultValue={article?.category ?? ""} />
      </label>

      <label>
        简介 summary
        <textarea name="summary" rows={4} defaultValue={article?.summary ?? ""} />
      </label>

      <label>
        标签 tags（用逗号分隔）
        <input name="tags" defaultValue={tagText} placeholder="写作, 素材, 高考" />
      </label>

      <div className="admin-card" style={{ padding: 18 }}>
        <h2 style={{ marginTop: 0 }}>正文 content（HTML 源码）</h2>
        <p className="muted">HTML 写法提示：</p>
        <ul className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
          <li>&lt;h2&gt;二级标题&lt;/h2&gt;</li>
          <li>&lt;h3&gt;三级标题&lt;/h3&gt;</li>
          <li>&lt;p&gt;正文段落&lt;/p&gt;</li>
          <li>&lt;strong&gt;加粗&lt;/strong&gt;</li>
          <li>&lt;blockquote&gt;&lt;p&gt;引用&lt;/p&gt;&lt;/blockquote&gt;</li>
          <li>&lt;ol&gt;&lt;li&gt;有序列表&lt;/li&gt;&lt;/ol&gt;</li>
          <li>&lt;ul&gt;&lt;li&gt;无序列表&lt;/li&gt;&lt;/ul&gt;</li>
        </ul>

        <textarea
          name="content"
          rows={20}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          placeholder="请粘贴或输入可发布的 HTML 源码"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
        />

        <h3 style={{ marginTop: 16, marginBottom: 10 }}>预览区域</h3>
        <div
          className="rich-article-content"
          style={{
            minHeight: 180,
            padding: "16px 18px",
            border: "1px solid #d9c7b5",
            borderRadius: 12,
            background: "#fff"
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>

      <div className="admin-form-row">
        <label>
          状态 status
          <select name="status" defaultValue={article?.status ?? "draft"} required>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          可见性 visibility
          <input name="visibility" defaultValue={article?.visibility ?? "public"} />
        </label>
      </div>

      <label className="admin-checkbox">
        <input
          name="is_pinned"
          type="checkbox"
          defaultChecked={Boolean(article?.is_pinned)}
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
