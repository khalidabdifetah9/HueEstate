import { Suspense, type ReactNode } from "react";
import ChatBot from "@/components/dashboard/main/ChatBot";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/main/DashboardShell";

async function DashboardAuthShell({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/signin");

  const { name, email, image, role } = session.user;

  return (
    <DashboardShell
      user={{ name, email, image: image ?? null, role: role ?? "user" }}
    >
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#F7F6F2] text-sm text-[#243D35]/70">
            Loading workspace...
          </div>
        }
      >
        <DashboardAuthShell>{children}</DashboardAuthShell>
      </Suspense>
      <ChatBot />
    </>
  );
}