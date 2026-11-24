import { requireSession } from "@/app/lib/auth";
import { householdCode } from "@/app/lib/session";
import AdminPageClient from "./client/AdminPageClient";
import HouseholdCodeCard from "./components/HouseholdCodeCard";

// The code is a secret: it reaches the browser only here, after the session check,
// as a prop in the server render (never through an API).
export default async function AdminPage() {
  await requireSession();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <HouseholdCodeCard code={householdCode()} />
      <AdminPageClient />
    </div>
  );
}
