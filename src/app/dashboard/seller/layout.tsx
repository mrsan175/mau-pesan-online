import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardLayoutClient } from "@/components/dashboard/layout/DashboardLayoutClient";

export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient
      userName={user.fullName || user.username || "Seller"}
      userEmail={user.email || ""}
    >
      {children}
    </DashboardLayoutClient>
  );
}
