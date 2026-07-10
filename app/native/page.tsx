import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NativeHomePage() {
  redirect("/native/profile");
}
