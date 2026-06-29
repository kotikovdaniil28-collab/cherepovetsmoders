import type { ReactNode } from "react";
import NativeShell from "./native-shell";
import "./native-shell.css";

export default function NativeLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <NativeShell>{children}</NativeShell>;
}
