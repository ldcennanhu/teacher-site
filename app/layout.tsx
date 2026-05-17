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
  .admin-button { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 0 18px; border: 0; border-radius: 999px; background: #8b4f39; color: white; font-weight: 700; text-decoration: none; cursor: pointer; }
  input, textarea { width: 100%; box-sizing: border-box; border: 1px solid #d9c7b5; border-radius: 12px; padding: 12px 14px; font: inherit; background: white; }
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
