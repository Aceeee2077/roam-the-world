import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "漫游地球｜发现世界旅游景点",
  description: "拖动地图、旋转地球，搜索并发现世界各地令人心动的旅游目的地。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
