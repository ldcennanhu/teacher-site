import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "孤登塔客语文馆后台",
  description: "Supabase-backed administration foundation for teacher-site content."
};

const globalStyles = `
  :root { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  body { margin: 0; background: #f8f4ed; color: #25313d; }
  a { color: #8b4f39; }

  .admin-shell { max-width: 980px; margin: 0 auto; padding: 48px 20px; }
  .admin-card { background: #fffaf2; border: 1px solid #eadccb; border-radius: 18px; padding: 28px; box-shadow: 0 18px 45px rgb(67 48 33 / 8%); }
  .admin-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .admin-heading-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
  .admin-button { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 0 18px; border: 0; border-radius: 999px; background: #8b4f39; color: white; font-weight: 700; text-decoration: none; cursor: pointer; }
  .admin-button:disabled { cursor: not-allowed; opacity: 0.68; }
  .admin-button-secondary { border: 1px solid #d9c7b5; background: #fffaf2; color: #8b4f39; }
  .admin-link-button { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 12px; border-radius: 999px; background: #f0e2d2; color: #74432f; font-weight: 700; text-decoration: none; white-space: nowrap; }
  .admin-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .admin-table-wrap { overflow-x: auto; border: 1px solid #eadccb; border-radius: 14px; background: white; }
  .admin-table { width: 100%; border-collapse: collapse; min-width: 860px; }
  .admin-table th, .admin-table td { padding: 13px 14px; border-bottom: 1px solid #eadccb; text-align: left; vertical-align: top; }
  .admin-table th { background: #f6ecdf; color: #5f3a2b; font-size: 14px; }
  .admin-table tr:last-child td { border-bottom: 0; }
  .admin-form-row { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .admin-checkbox { display: flex; align-items: center; gap: 10px; }
  .admin-checkbox input { width: auto; }
  .admin-alert { border: 1px solid #f1b8a0; border-radius: 12px; padding: 12px 14px; background: #fff0e9; color: #8a3215; }
  .admin-warning { border-left: 4px solid #c87552; padding: 12px 14px; background: #fff4e8; color: #74432f; }

  input, textarea, select { width: 100%; box-sizing: border-box; border: 1px solid #d9c7b5; border-radius: 12px; padding: 12px 14px; font: inherit; background: white; }
  label { display: grid; gap: 8px; font-weight: 700; }
  form { display: grid; gap: 16px; }
  .muted { color: #667085; }

  .admin-stats { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); margin: 24px 0; }
  .admin-stat-card { display: grid; gap: 8px; border: 1px solid #eadccb; border-radius: 16px; padding: 18px; background: #fffaf2; }
  .admin-stat-number { color: #8b4f39; font-size: 32px; line-height: 1; font-weight: 800; }
  .admin-stat-label { color: #667085; font-size: 14px; font-weight: 700; }

  .article-detail-shell {
    max-width: 860px;
    margin: 0 auto;
    padding: 48px 18px 84px;
  }
  .article-detail-card {
    background: #fffdf8;
    border: 1px solid #e9ddcf;
    border-radius: 20px;
    padding: clamp(24px, 4vw, 40px);
    box-shadow: 0 14px 38px rgb(67 48 33 / 8%);
  }
  .article-breadcrumb { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; color: #667085; font-size: 14px; }
  .article-breadcrumb a { text-decoration: none; color: #8b4f39; font-weight: 700; }
  .article-detail-header { max-width: 680px; margin: 0 auto; }
  .article-detail-header h1 {
    margin: 8px 0 14px;
    font-size: clamp(28px, 4.8vw, 38px);
    line-height: 1.28;
    letter-spacing: 0.01em;
    color: #1f2d3d;
  }
  .article-eyebrow { margin: 0; color: #b65d3b; font-weight: 700; letter-spacing: 0.02em; font-size: 14px; }
  .article-summary { font-size: clamp(16px, 2.6vw, 18px); line-height: 1.95; color: #475467; margin: 0; }
  .article-detail-meta { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 14px; color: #667085; font-size: 14px; }
  .article-detail-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .article-detail-tags span { border: 1px solid #d9e3e2; border-radius: 999px; padding: 4px 10px; background: #f8fcfb; color: #49635f; font-size: 13px; }

  .article-detail-content {
    max-width: 680px;
    margin: 30px auto 0;
    font-size: clamp(17px, 2.8vw, 19px);
    line-height: 2;
    color: #25313d;
  }

  .article-detail-content p,
  .rich-article-content p {
    margin: 0 0 22px;
    text-align: justify;
    text-indent: 2em;
  }


  .article-detail-content h1,
  .article-detail-content h2,
  .article-detail-content h3,
  .article-detail-content li,
  .article-detail-content blockquote p,
  .article-detail-content table p,
  .rich-article-content h1,
  .rich-article-content h2,
  .rich-article-content h3,
  .rich-article-content li,
  .rich-article-content blockquote p,
  .rich-article-content table p {
    text-indent: 0;
  }

  .article-detail-content h1,
  .article-detail-content h2,
  .article-detail-content h3,
  .article-detail-content h4,
  .rich-article-content h1,
  .rich-article-content h2,
  .rich-article-content h3,
  .rich-article-content h4 {
    color: #1f2d3d;
    line-height: 1.35;
  }

  .article-detail-content h1,
  .rich-article-content h1 {
    font-size: 32px;
  }

  .article-detail-content h2,
  .rich-article-content h2 {
    font-size: 26px;
    margin: 1.55em 0 0.7em;
  }

  .article-detail-content h3,
  .rich-article-content h3 {
    font-size: 22px;
    margin: 1.4em 0 0.65em;
  }

  .article-detail-content strong,
  .rich-article-content strong {
    font-weight: 800;
    color: #1f2d3d;
  }

  .article-detail-content ul,
  .article-detail-content ol,
  .rich-article-content ul,
  .rich-article-content ol {
    margin: 0 0 22px;
    padding-left: 1.55em;
    text-indent: 0;
  }

  .article-detail-content li,
  .rich-article-content li {
    margin: 0.35em 0;
  }

  .article-detail-content blockquote,
  .rich-article-content blockquote {
    margin: 1.6em auto;
    padding: 14px 18px;
    max-width: 92%;
    border-left: 3px solid #c87552;
    border-radius: 10px;
    color: #5f4d43;
    background: #fdf3eb;
  }

  .article-detail-content blockquote p,
  .rich-article-content blockquote p {
    margin: 0;
  }

  .article-detail-content table,
  .rich-article-content table {
    width: 100%;
    margin: 22px 0;
    border-collapse: collapse;
    overflow: hidden;
    border-radius: 14px;
    background: #fffdf8;
  }

  .article-detail-content th,
  .article-detail-content td,
  .rich-article-content th,
  .rich-article-content td {
    padding: 12px 14px;
    border: 1px solid #eadccb;
    text-align: left;
    vertical-align: top;
  }

  .article-detail-content th,
  .rich-article-content th {
    background: #f6ecdf;
    color: #5f3a2b;
  }

  .article-detail-content hr,
  .rich-article-content hr {
    margin: 2em 0;
    border: none;
    border-top: 1px solid #eadccb;
  }

  .article-empty { color: #667085; }
  .article-detail-footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #eadccb; }
  .article-back-link { display: inline-flex; align-items: center; min-height: 38px; padding: 0 14px; border-radius: 999px; background: #f5e6d7; color: #74432f; font-weight: 700; text-decoration: none; border: 1px solid #e2ccb8; }

  @media (max-width: 680px) {
    .admin-shell { padding: 28px 14px; }
    .admin-card { padding: 20px; }
    .article-detail-shell { padding: 28px 12px 64px; }
    .article-detail-card { padding: 20px; border-radius: 16px; }
    .article-detail-content { font-size: 17px; line-height: 1.92; margin-top: 24px; }
    .article-summary { font-size: 16px; }
    .article-detail-content h2,
    .rich-article-content h2 { font-size: 23px; margin: 1.35em 0 0.6em; }
    .article-detail-content h3,
    .rich-article-content h3 { font-size: 20px; }
    .article-detail-content blockquote,
    .rich-article-content blockquote { max-width: 100%; padding: 12px 14px; }
    .article-detail-content table,
    .rich-article-content table { display: block; overflow-x: auto; }
  }
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        {children}
      </body>
    </html>
  );
}
