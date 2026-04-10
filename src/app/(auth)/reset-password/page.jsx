"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import AuthShell from "@/components/AuthShell";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    if (!uid || !token) setTokenInvalid(true);
  }, [uid, token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const pwVal = watch("password", "");

  async function onSubmit(data) {
    setServerError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password/", {
        uid,
        token,
        new_password: data.password,
        confirm_password: data.confirm_password,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      const errData = err?.response?.data;
      const detail =
        errData?.detail ||
        errData?.token?.[0] ||
        errData?.uid?.[0] ||
        errData?.new_password?.[0] ||
        "Reset failed. The link may have expired.";
      setServerError(detail);
    } finally {
      setLoading(false);
    }
  }

  // Password strength indicator
  function getStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  const strength = getStrength(pwVal);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength] || "";
  const strengthColor = ["", "#e05c5c", "#f5c842", "#3dd68c", "#3dd68c"][strength] || "transparent";

  if (tokenInvalid) {
    return (
      <AuthShell title="Invalid link." subtitle="# this reset link is broken">
        <div className="alert alert-error">
          The reset link is missing required parameters. Please{" "}
          <Link href="/forgot-password" style={{ color: "var(--green)" }}>
            request a new one
          </Link>.
        </div>
        <p className="auth-footer">
          <Link href="/login">← Back to login</Link>
        </p>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell title="Password updated." subtitle="# redirecting to login...">
        <div className="alert alert-success">
          ✓ Your password has been reset successfully. Redirecting in 3 seconds…
        </div>
        <p className="auth-footer">
          <Link href="/login">Go to login now</Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="New password."
      subtitle="# choose a strong password"
    >
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            autoComplete="new-password"
            autoFocus
            className={errors.password ? "error-input" : ""}
            {...register("password")}
          />
          {errors.password && (
            <p className="field-error">⚠ {errors.password.message}</p>
          )}

          {/* Strength meter */}
          {pwVal && (
            <div className="strength-meter">
              <div className="strength-bars">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="strength-bar"
                    style={{
                      background: i <= strength ? strengthColor : "var(--border)",
                      transition: "background 0.25s ease",
                    }}
                  />
                ))}
              </div>
              <span className="strength-label" style={{ color: strengthColor }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="confirm_password">Confirm New Password</label>
          <input
            id="confirm_password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className={errors.confirm_password ? "error-input" : ""}
            {...register("confirm_password")}
          />
          {errors.confirm_password && (
            <p className="field-error">⚠ {errors.confirm_password.message}</p>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : "Reset Password →"}
        </button>
      </form>

      <p className="auth-footer">
        <Link href="/login">← Back to login</Link>
      </p>

      <style jsx>{`
        .strength-meter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }
        .strength-bar {
          height: 3px;
          flex: 1;
          border-radius: 2px;
        }
        .strength-label {
          font-family: var(--mono);
          font-size: 0.65rem;
          min-width: 40px;
          text-align: right;
        }
      `}</style>
    </AuthShell>
  );
}
