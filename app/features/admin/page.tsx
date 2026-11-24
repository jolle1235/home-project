import { requireSession } from "@/app/lib/auth";
import { householdCode } from "@/app/lib/session";
import PageContainer from "@/app/components/PageContainer";
import AdminPageClient from "./client/AdminPageClient";
import HouseholdCodeCard from "./components/HouseholdCodeCard";

// The code is a secret: it reaches the browser only here, after the session check,
// as a prop in the server render (never through an API).
export default async function AdminPage() {
  await requireSession();

  return (
    <PageContainer>
      <h1 className="text-page-title mb-6">Indstillinger</h1>
      <HouseholdCodeCard code={householdCode()} />
      <AdminPageClient />
    </PageContainer>
  );
}
