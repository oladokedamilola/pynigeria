"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {registerAPI} from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import AuthShell from "@/components/AuthShell";

const schema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username too long")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    email: z.string().email("Enter a valid email address"),
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

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  if (isAuthenticated) {
    router.replace("/dashboard");
    return null;
  }

  async function onSubmit(data) {
    setServerError("");
    setLoading(true);
    try {
      await registerAPI({
        username: data.username,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
      });
      router.push("/verify-email");
    } catch (err) {
      const errData = err?.response?.data;
      if (errData) {
        const first = Object.values(errData)[0];
        setServerError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setServerError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Join Python 9ja." subtitle="# create your account">
      {serverError && (
        <div className="alert alert-error">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="snake_case_name"
            autoComplete="username"
            className={errors.username ? "error-input" : ""}
            {...register("username")}
          />
          {errors.username && (
            <p className="field-error">⚠ {errors.username.message}</p>
          )}
          <p className="field-hint">Letters, numbers, and underscores only</p>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={errors.email ? "error-input" : ""}
            {...register("email")}
          />
          {errors.email && (
            <p className="field-error">⚠ {errors.email.message}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Min 8 chars · 1 uppercase · 1 number"
            autoComplete="new-password"
            className={errors.password ? "error-input" : ""}
            {...register("password")}
          />
          {errors.password && (
            <p className="field-error">⚠ {errors.password.message}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="confirm_password">Confirm Password</label>
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
          {loading ? <span className="spinner" /> : "Create Account →"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link href="/login">Sign in</Link>
      </p>

      <style jsx>{`
        .field-hint {
          font-family: var(--mono);
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
          opacity: 0.7;
        }
      `}</style>
    </AuthShell>
  );
}