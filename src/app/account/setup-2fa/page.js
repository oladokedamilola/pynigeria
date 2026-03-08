"use client";
import React, { useState } from "react";
import Link from "next/link";
import { setupTOTP, getQRCode, verifyTOTP } from "@/lib/api";

const steps = ["Create Device", "Scan QR", "Verify", "Done"];

export default function Setup2FAPage() {
  const [step, setStep]         = useState(0);
  const [email, setEmail]       = useState("");
  const [qrUrl, setQrUrl]       = useState("");   // object URL for the PNG blob
  const [otpToken, setOtpToken] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // ── Step 0: Create TOTP device ──────────────────────────────────────────────
  const handleCreateDevice = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    try {
      await setupTOTP({ email });
      await fetchQRCode();   // immediately fetch QR after device created
      setStep(1);
    } catch (err) {
      const res = err?.response?.data;
      setError(
        res?.data?.error ||
        res?.detail ||
        Object.values(res || {})?.[0]?.[0] ||
        "Failed to create TOTP device."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch QR code PNG from backend ─────────────────────────────────────────
  const fetchQRCode = async () => {
    try {
      // getQRCode should return the raw blob (arraybuffer/blob response type)
      const blob = await getQRCode({ email });
      const objectUrl = URL.createObjectURL(blob);
      setQrUrl(objectUrl);
    } catch (err) {
      setError("Failed to load QR code. Please try again.");
    }
  };

  // ── Step 2: Verify OTP token ────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otpToken) { setError("OTP token is required"); return; }
    setLoading(true);
    setError("");
    try {
      await verifyTOTP({ email, otp_token: otpToken });
      setStep(3);
    } catch (err) {
      const res = err?.response?.data;
      setError(
        res?.data?.error ||
        res?.detail ||
        Object.values(res || {})?.[0]?.[0] ||
        "Invalid OTP token. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 panel-left pattern-dots flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <Link href="/" className="flex items-center gap-2 flex-shrink-0 z-10">
          <img
            src="/logo.svg" alt="Python 9ja" className="w-8 h-8 rounded-lg"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div
            style={{ display: "none" }}
            className="w-8 h-8 green-gradient rounded-lg items-center justify-center text-white font-bold text-sm"
          >
            Py
          </div>
          <span className="font-display font-bold text-lg text-green-800">
            Python<span className="text-green-500">9ja</span>
          </span>
        </Link>

        <div className="z-10 space-y-6">
          <div className="text-5xl">🔐</div>
          <h2 className="font-display text-4xl text-black leading-tight">
            Secure your account <br />
            <span className="text-emerald-600">with OTP login</span>
          </h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-xs">
            Python 9ja uses TOTP-based login instead of passwords. Set up your authenticator app once and use it every time you sign in.
          </p>
          {[
            "📱 Works with Google Authenticator",
            "📱 Works with Authy",
            "📱 Works with any TOTP app",
            "🔒 More secure than passwords",
          ].map((p) => (
            <div key={p} className="text-black text-sm font-medium">{p}</div>
          ))}
        </div>

        <p className="text-emerald-200/40 text-xs z-10">
          © {new Date().getFullYear()} Python 9ja · Made in Nigeria 🇳🇬
        </p>
      </div>

      {/* ── Right: form ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md fade-up">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.svg" className="w-8 h-8 rounded-lg" alt="Python 9ja"
                 onError={(e) => { e.target.style.display = "none"; }} />
            <span className="font-display text-lg text-gray-900">
              Python<span className="text-emerald-600">9ja</span>
            </span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  i === step ? "step-active" : i < step ? "step-done" : "step-idle"
                }`}>
                  <span>{i < step ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP 0: Enter email to create device ── */}
          {step === 0 && (
            <div className="slide-in">
              <h1 className="font-display text-3xl text-gray-900 mb-1">Set up 2FA</h1>
              <p className="text-gray-400 text-sm mb-8">
                Enter your email to get started. We'll generate a QR code for your authenticator app.
              </p>

              {error && (
                <div className="error-shake mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateDevice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required placeholder="you@example.com"
                    className="input-focus w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 placeholder-gray-400 transition-all"
                  />
                </div>

                {/* Info notice */}
                <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs leading-relaxed">
                  ℹ️ Make sure your email is verified before proceeding. Check your inbox for a verification link if you haven't already.
                </div>

                <button type="submit" disabled={loading}
                        className="btn-green w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting up…
                    </span>
                  ) : "Generate QR Code →"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Already set up?{" "}
                <Link href="/account/signin" className="text-emerald-600 hover:underline font-medium">
                  Go to Sign In
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP 1: Scan QR code ── */}
          {step === 1 && (
            <div className="slide-in">
              <h1 className="font-display text-3xl text-gray-900 mb-1">Scan QR Code</h1>
              <p className="text-gray-400 text-sm mb-6">
                Open your authenticator app and scan the QR code below.
              </p>

              {error && (
                <div className="error-shake mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span><span>{error}</span>
                </div>
              )}

              {/* QR Code display */}
              <div className="flex justify-center mb-6">
                {qrUrl ? (
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                    <img src={qrUrl} alt="TOTP QR Code" className="w-52 h-52" />
                  </div>
                ) : (
                  <div className="w-52 h-52 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <span className="w-8 h-8 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mb-6 space-y-2">
                {[
                  "Open Google Authenticator, Authy, or any TOTP app",
                  "Tap the + button to add a new account",
                  'Select "Scan QR code" and point your camera at the code above',
                  "Once added, click Continue below",
                ].map((instruction, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{instruction}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => { setStep(2); setError(""); }}
                      className="btn-green w-full py-3.5 rounded-xl text-white font-semibold text-sm">
                I've Scanned It →
              </button>

              <button onClick={() => fetchQRCode()}
                      className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                🔄 Reload QR Code
              </button>
            </div>
          )}

          {/* ── STEP 2: Verify OTP token ── */}
          {step === 2 && (
            <div className="slide-in">
              <h1 className="font-display text-3xl text-gray-900 mb-1">Verify OTP</h1>
              <p className="text-gray-400 text-sm mb-2">
                Enter the 6-digit code from your authenticator app to confirm setup.
              </p>
              <p className="text-emerald-600 font-semibold text-sm mb-8">{email}</p>

              {error && (
                <div className="error-shake mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">6-digit code</label>
                  <input
                    type="text" value={otpToken}
                    onChange={(e) => { setOtpToken(e.target.value); setError(""); }}
                    required placeholder="123456" maxLength={6}
                    inputMode="numeric" pattern="[0-9]*"
                    className="input-focus w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 placeholder-gray-400 tracking-widest text-center text-lg transition-all"
                  />
                </div>

                <button type="submit" disabled={loading}
                        className="btn-green w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying…
                    </span>
                  ) : "Verify & Activate 🔐"}
                </button>
              </form>

              <button onClick={() => { setStep(1); setError(""); }}
                      className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                ← Back to QR Code
              </button>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div className="slide-in text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-display text-3xl text-gray-900 mb-2">2FA Activated!</h2>
              <p className="text-gray-500 text-sm mb-2">
                Your authenticator app is now linked to <strong>{email}</strong>.
              </p>
              <p className="text-gray-400 text-sm mb-8">
                You can now sign in using your email and the OTP code from your authenticator app.
              </p>

              <div className="mb-8 px-4 py-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left space-y-1">
                <p className="text-emerald-800 font-semibold text-sm">✅ What's set up:</p>
                <p className="text-emerald-700 text-xs">• TOTP device linked to your account</p>
                <p className="text-emerald-700 text-xs">• 2FA enabled on login</p>
                <p className="text-emerald-700 text-xs">• You'll need your authenticator app every time you sign in</p>
              </div>

              <Link
                href="/account/signin"
                className="btn-green inline-block px-8 py-3.5 rounded-xl text-white font-semibold text-sm"
              >
                Go to Sign In →
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
