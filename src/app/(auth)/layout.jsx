"use client";

/**
 * Auth route group layout — (auth)/layout.jsx
 *
 * Wraps all pages under src/app/(auth)/:
 *   /login, /register, /verify-email, /forgot-password, /reset-password
 *
 * Behaviour:
 *  - Authenticated users visiting any of these pages are sent to /dashboard
 *  - The redirect is skipped for /verify-email and /reset-password
 *    (a just-logged-in user still needs to verify; reset needs no session)
 */

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

// Pages where an authenticated user is allowed to remain
const ALLOW_AUTHENTICATED = ["/verify-email", "/reset-password"];

export default function AuthLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const allowed = ALLOW_AUTHENTICATED.some((p) => pathname.endsWith(p));
    if (isAuthenticated && !allowed) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return <>{children}</>;
}
