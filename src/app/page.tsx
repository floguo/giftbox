import { createId } from "@paralleldrive/cuid2";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  // Generate a new CUID
  const id = createId();
  // Redirect to the new page
  redirect(`/${id}`);
}
