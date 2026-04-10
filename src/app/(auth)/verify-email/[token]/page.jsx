"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { verifyEmailComplete } from "@/lib/api";
import Link from "next/link";

export default function VerifyEmailCompletePage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("The link may have expired or already been used.");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token found in the link.");
      return;
    }

    verifyEmailComplete(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/login"), 3000);
      })
      .catch((err) => {
        const detail =
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          "The link may have expired or already been used.";
        setErrorMessage(detail);
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex font-sans">
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md fade-up text-center">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-10 lg:hidden">
            <img
              src="/logo.svg"
              className="w-8 h-8 rounded-lg"
              alt="Python 9ja"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <span className="font-display text-lg text-gray-900">
              Python<span className="text-emerald-600">9ja</span>
            </span>
          </Link>

          {/* ── Verifying ── */}
          {status === "verifying" && (
            <div className="slide-in py-8 space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              </div>
              <h2 className="font-display text-2xl text-gray-900">Verifying your email…</h2>
              <p className="text-gray-400 text-sm">This will only take a moment.</p>
            </div>
          )}

          {/* ── Success ── */}
          {status === "success" && (
            <div className="slide-in py-8 space-y-4">
              <div className="text-6xl">🎉</div>
              <h2 className="font-display text-3xl text-gray-900">Email verified!</h2>
              <p className="text-gray-500 text-sm">
                Your account has been verified successfully.
              </p>
              <p className="text-gray-400 text-sm">
                Redirecting you to sign in…
              </p>
              <div className="pt-4 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="btn-green inline-block px-8 py-3.5 rounded-xl text-white font-semibold text-sm"
                >
                  Go to Sign In →
                </Link>
                <Link href="/" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">
                  Back to home
                </Link>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {status === "error" && (
            <div className="slide-in py-8 space-y-4">
              <div className="text-6xl">😕</div>
              <h2 className="font-display text-3xl text-gray-900">Verification failed</h2>
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-left">
                ⚠️ {errorMessage}
              </div>
              <p className="text-gray-400 text-sm">
                Request a new verification link below.
              </p>
              <div className="pt-4 flex flex-col gap-3">
                <Link
                  href="/verify-email"
                  className="btn-green inline-block px-8 py-3.5 rounded-xl text-white font-semibold text-sm"
                >
                  Resend Verification Email
                </Link>
                <Link href="/login" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}