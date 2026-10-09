import { redirect } from "next/navigation";

// Every 404 (unknown URL, missing blog post, missing product) goes to the homepage.
export default function NotFound() {
  redirect("/");
}
