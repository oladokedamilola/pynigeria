"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import AuthShell from "@/components/AuthShell";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setServerError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password/", { email: data.email });
      setSubmitted(true);
    } catch (err) {
      // Don't leak whether email exists — show generic success anyway
      // unless it's a server/network error
      if (!err?.response) {
        setServerError("Network error. Check your connection.");
      } else {
        setSubmitted(true); // intentional: don't reveal account existence
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthShell
        title="Check your inbox."
        subtitle="# password reset link sent"
      >
        <div className="success-state">
          <div className="success-icon">✉</div>
          <p className="success-text">
            If <strong>{getValues("email")}</strong> is registered, you&apos;ll receive a reset link shortly.
          </p>
          <p className="success-note">
            Check your spam folder if it doesn&apos;t arrive in a few minutes.
          </p>
        </div>

        <p className="auth-footer">
          <Link href="/login">← Back to login</Link>
        </p>

        <style jsx>{`
          .success-state { text-align: center; padding: 1rem 0 1.5rem; }
          .success-icon {
            font-size: 2.5rem; margin-bottom: 1rem;
            display: block;
            animation: pop 0.4s ease;
          }
          @keyframes pop {
            0%{transform:scale(0.6);opacity:0}
            80%{transform:scale(1.1)}
            100%{transform:scale(1);opacity:1}
          }
          .success-text {
            font-family: var(--mono); font-size: 0.82rem;
            color: var(--text-dim); line-height: 1.6; margin-bottom: 0.75rem;
          }
          .success-text strong { color: var(--green); font-weight: 600; }
          .success-note {
            font-family: var(--mono); font-size: 0.7rem;
            color: var(--text-muted);
          }
        `}</style>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset password."
      subtitle="# we'll email you a reset link"
    >
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            className={errors.email ? "error-input" : ""}
            {...register("email")}
          />
          {errors.email && (
            <p className="field-error">⚠ {errors.email.message}</p>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : "Send Reset Link →"}
        </button>
      </form>

      <p className="auth-footer">
        Remembered it?{" "}
        <Link href="/login">Back to login</Link>
      </p>
    </AuthShell>
  );
}
