import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password | HueEstate",
  referrer: "no-referrer" as const,
};

async function ResetPasswordContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (error || !token) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-semibold">This link isn&apos;t valid</h1>
        <p className="mt-3 text-base text-[#243D35]/70">
          The reset link is invalid, has expired, or was already used. Request
          a new one to continue.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 block w-full rounded-md bg-[#243D35] px-6 py-4 text-base font-medium text-white transition hover:bg-[#1a2d27]"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  return (
    <AuthCard>
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-[#243D35]/70">
            Verifying reset link...
          </div>
        }
      >
        <ResetPasswordContent searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}