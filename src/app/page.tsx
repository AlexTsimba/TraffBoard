import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/main/dashboard");
  return <>Redirecting...</>;
}
