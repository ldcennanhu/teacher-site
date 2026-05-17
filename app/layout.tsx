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
