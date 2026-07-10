import type { ReactNode } from "react";
import { redirect } from "next/navigation";

export default function NativeLayout({
  children: _children
}: Readonly<{
  children: ReactNode;
}>) {
  redirect("/profile");
}
