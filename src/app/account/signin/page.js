"use client";
import React, { useState } from "react";
import Link from "next/link";
import { login, getSocialAuthUrl } from "@/lib/api";

export default function SignInPage() {
  const [step, setStep]       = useState(0); // 0 = email, 1 = otp
  const [form, setForm]       = useState({ email: "", otp_code: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [warning, setWarning] = useState(""); // unverified email warning

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // Step 0 — validate email and move to OTP step
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!form.email) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError("Enter a valid email"); return; }
    setError("");
    setStep(1);
  };

  // Step 1 — submit email + otp_code to backend
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!form.otp_code) { setError("OTP code is required"); return; }

    setLoading(true);
    setError("");
    setWarning("");

    try {
      const data = await login({ email: form.email, otp_code: form.otp_code });

      // Support multiple token response shapes
      const access  = data?.data?.access  || data?.access;
      const refresh = data?.data?.refresh || data?.refresh;
      const user    = data?.data;

      if (access)  localStorage.setItem("access",  access);
      if (refresh) localStorage.setItem("refresh", refresh);
      if (user && typeof user === "object") {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Warn if email not verified but still allow in
      if (user?.is_email_verified === false) {
        setWarning("Your email is not verified. Some features may be limited.");
      }

      window.location.href = "/dashboard";
    } catch (err) {
      const res = err?.response?.data;
      const msg =
        res?.detail               ||
        res?.error                ||
        res?.non_field_errors?.[0]||
        Object.values(res || {})?.[0]?.[0] ||
        "Login failed. Please check your credentials.";
      setError(typeof msg === "object" ? JSON.stringify(msg) : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = getSocialAuthUrl(provider);
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-5/12 panel-left pattern-dots flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <Link href="/" className="flex items-center gap-3 z-10">
          <img src="/logo.svg" alt="Python 9ja" className="w-10 h-10 rounded-xl"
               onError={(e) => { e.target.style.display = "none"; }} />
          <span className="font-display text-xl text-white">
            Python<span className="text-emerald-400">9ja</span>
          </span>
        </Link>

        <div className="z-10 space-y-6">
          <div className="text-5xl">🐍</div>
          <h2 className="font-display text-4xl text-white leading-tight">
            Welcome back to <br />
            <span className="text-emerald-400">Nigeria's Python hub</span>
          </h2>
          <p className="text-emerald-200/70 text-base leading-relaxed max-w-xs">
            Connect with thousands of Python developers, find jobs, and stay
            up‑to‑date with tech news — all in one place.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {["🧑🏾‍💻", "👩🏽‍💻", "👨🏿‍💻", "👩🏾‍💻"].map((emoji, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-emerald-800 border-2 border-emerald-900 flex items-center justify-center text-sm">
                  {emoji}
                </div>
              ))}
            </div>
            <span className="text-emerald-300 text-sm font-medium">2,400+ members waiting</span>
          </div>
        </div>

        <p className="text-emerald-200/40 text-xs z-10">
          © {new Date().getFullYear()} Python 9ja · Made in Nigeria 🇳🇬
        </p>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md fade-up">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.svg" alt="Python 9ja" className="w-8 h-8 rounded-lg"
                 onError={(e) => { e.target.style.display = "none"; }} />
            <span className="font-display text-lg text-gray-900">
              Python<span className="text-emerald-600">9ja</span>
            </span>
          </Link>

          {/* ── STEP 0: Email ── */}
          {step === 0 && (
            <div className="slide-in">
              <h1 className="font-display text-3xl text-gray-900 mb-1">Sign in</h1>
              <p className="text-gray-400 text-sm mb-8">
                Don't have an account?{" "}
                <Link href="/account/signup" className="text-emerald-600 font-semibold hover:underline">
                  Create one free
                </Link>
              </p>

              {/* Social login */}
              <div className="flex gap-3 mb-6">
                <button onClick={() => handleSocialLogin("google-oauth2")}
                        className="social-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button onClick={() => handleSocialLogin("github")}
                        className="social-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or continue with email</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {error && (
                <div className="error-shake mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} required placeholder="you@example.com"
                    className="input-focus w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 placeholder-gray-400 transition-all"
                  />
                </div>
                <button type="submit"
                        className="btn-green w-full py-3.5 rounded-xl text-white font-semibold text-sm">
                  Continue →
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 1: OTP Code ── */}
          {step === 1 && (
            <div className="slide-in">
              <button onClick={() => { setStep(0); setError(""); }}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
                ← Back
              </button>

              <h1 className="font-display text-3xl text-gray-900 mb-1">Enter OTP</h1>
              <p className="text-gray-400 text-sm mb-2">
                Open your authenticator app and enter the 6-digit code for
              </p>
              <p className="text-emerald-600 font-semibold text-sm mb-8">{form.email}</p>

              {error && (
                <div className="error-shake mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span><span>{error}</span>
                </div>
              )}

              {warning && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span><span>{warning}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">6-digit OTP code</label>
                  <input
                    type="text" name="otp_code" value={form.otp_code}
                    onChange={handleChange} required
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="input-focus w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 placeholder-gray-400 tracking-widest text-center text-lg transition-all"
                  />
                </div>

                <button type="submit" disabled={loading}
                        className="btn-green w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : "Sign In →"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Don't have an authenticator app set up?{" "}
                <Link href="/account/setup-2fa" className="text-emerald-600 hover:underline font-medium">
                  Set up 2FA
                </Link>
              </p>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in you agree to our{" "}
            <Link href="/terms" className="text-emerald-600 hover:underline">Terms</Link>{" "}
            &{" "}
            <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
