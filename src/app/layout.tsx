import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Life Achievements · 人生成就",
  description: "人生是一场开放世界游戏。记录属于你的每一次解锁。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
