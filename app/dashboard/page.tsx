import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/src/lib/auth";
import DashboardClient from "@/src/components/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const allowedEmails =
    process.env.ALLOWED_EMAILS?.split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean) ?? [];

  const userEmail = session.user.email.toLowerCase();

  if (!allowedEmails.includes(userEmail)) {
    redirect("/auth/error?error=AccessDenied");
  }

  return <DashboardClient userEmail={userEmail} />;
}