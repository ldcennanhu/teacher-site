"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function plainTextToHtml(value: string) {
  const blocks = value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return "";
  }

  return blocks
    .map((block) => {
      const escaped = escapeHtml(block).replace(/\n/g, "<br>");
      return `<p>${escaped}</p>`;
    })
    .join("");
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

function initialEditorHtml(content?: string | null) {
  const value = String(content || "").trim();

  if (!value) {
    return "";
  }

  return looksLikeHtml(value) ? removeUnsafeHtml(value) : plainTextToHtml(value);
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="admin-button" type="submit" disabled={pending}>
      {pending ? "保存中……" : label}
    </button>
  );
}

type ToolbarButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
};

function ToolbarButton({ children, onClick, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      style={{
        minHeight: 34,
        padding: "0 12px",
        border: "1px solid #d9c7b5",
        borderRadius: 999,
        background: "#fffaf2",
        color: "#74432f",
        fontWeight: 700,
        cursor: "pointer"
      }}
    >
      {children}
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
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [contentHtml, setContentHtml] = useState(() => initialEditorHtml(article?.content));

  const tagText = useMemo(() => {
    return (article?.tags ?? []).join(", ");
  }, [article?.tags]);

  useEffect(() => {
    if (!isSlugManuallyEdited) {
      setSlug(slugifyTitle(title));
    }
  }, [isSlugManuallyEdited, title]);

  function syncEditorContent() {
    const html = editorRef.current?.innerHTML ?? "";
    setContentHtml(removeUnsafeHtml(html));
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function exec(command: string, value?: string) {
    focusEditor();
    document.execCommand(command, false, value);
    syncEditorContent();
  }

  function applyBlock(tag: "p" | "h2" | "h3" | "blockquote") {
    focusEditor();
    document.execCommand("formatBlock", false, tag);
    syncEditorContent();
  }

  function clearFormat() {
    focusEditor();
    document.execCommand("removeFormat", false);
    syncEditorContent();
  }

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
        <h2 style={{ marginTop: 0 }}>正文 content</h2>
        <p className="muted">
          支持常用富文本编辑。可直接粘贴文字，再用工具栏设置标题、加粗、列表、居中和缩进。
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            margin: "12px 0 14px"
          }}
        >
          <ToolbarButton title="正文" onClick={() => applyBlock("p")}>
            正文
          </ToolbarButton>
          <ToolbarButton title="二级标题" onClick={() => applyBlock("h2")}>
            二级标题
          </ToolbarButton>
          <ToolbarButton title="三级标题" onClick={() => applyBlock("h3")}>
            三级标题
          </ToolbarButton>
          <ToolbarButton title="加粗" onClick={() => exec("bold")}>
            加粗
          </ToolbarButton>
          <ToolbarButton title="引用" onClick={() => applyBlock("blockquote")}>
            引用
          </ToolbarButton>
          <ToolbarButton title="有序列表" onClick={() => exec("insertOrderedList")}>
            编号
          </ToolbarButton>
          <ToolbarButton title="无序列表" onClick={() => exec("insertUnorderedList")}>
            列表
          </ToolbarButton>
          <ToolbarButton title="左对齐" onClick={() => exec("justifyLeft")}>
            左对齐
          </ToolbarButton>
          <ToolbarButton title="居中" onClick={() => exec("justifyCenter")}>
            居中
          </ToolbarButton>
          <ToolbarButton title="右对齐" onClick={() => exec("justifyRight")}>
            右对齐
          </ToolbarButton>
          <ToolbarButton title="增加缩进" onClick={() => exec("indent")}>
            增加缩进
          </ToolbarButton>
          <ToolbarButton title="减少缩进" onClick={() => exec("outdent")}>
            减少缩进
          </ToolbarButton>
          <ToolbarButton title="清除格式" onClick={clearFormat}>
            清除格式
          </ToolbarButton>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncEditorContent}
          onBlur={syncEditorContent}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
          style={{
            minHeight: 420,
            maxHeight: 720,
            overflowY: "auto",
            padding: "18px 20px",
            border: "1px solid #d9c7b5",
            borderRadius: 14,
            background: "white",
            lineHeight: 1.9,
            fontSize: 16,
            outline: "none",
            whiteSpace: "normal"
          }}
        />

        <textarea
          name="content"
          value={contentHtml}
          readOnly
          required
          style={{ display: "none" }}
        />

        <p className="muted" style={{ marginTop: 12 }}>
          提醒：从 Word 或网页复制内容后，建议先检查标题、加粗、列表和段落是否正常；发布前请预览文章详情页。
        </p>
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
