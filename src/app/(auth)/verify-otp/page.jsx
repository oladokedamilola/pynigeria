"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {loginTOTP,VerifyEmailBegin} from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import AuthShell from "@/components/AuthShell";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { login,setUser } = useAuth();

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Start cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function handleDigitChange(index, val) {
    // Accept only single digit
    const cleaned = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError("");
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const email = localStorage.getItem("email")
      print(email)
      const res = await loginTOTP({otp:otp,email:email});
      // Backend may return tokens on verification
      if (res?.access) await login(res);
      router.push("/dashboard");
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.otp?.[0];
      if (detail?.toLowerCase().includes("expired")) {
        setError("OTP expired — request a new one below.");
      } else {
        setError(detail || "Invalid OTP. Please try again.");
      }
      // Clear boxes on wrong code
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError("");
    try {
      await VerifyEmailBegin(data);
      setSuccess("A new OTP has been sent to your email.");
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("Couldn't resend OTP. Try again.");
    } finally {
      setResendLoading(false);
    }
  }

  const otpValue = digits.join("");
  const isComplete = otpValue.length === OTP_LENGTH;

  return (
    <AuthShell
      title="Verify your email."
      subtitle="# enter the 6-digit code sent to you"
    >
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="otp-row" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`otp-box ${error ? "otp-error" : ""} ${d ? "otp-filled" : ""}`}
              autoFocus={i === 0}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !isComplete}
        >
          {loading ? <span className="spinner" /> : "Verify →"}
        </button>
      </form>

      <div className="resend-row">
        <span>Didn&apos;t get the code?</span>
        <button
          type="button"
          className="resend-btn"
          onClick={handleResend}
          disabled={cooldown > 0 || resendLoading}
        >
          {resendLoading
            ? "Sending..."
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend OTP"}
        </button>
      </div>

      <style jsx>{`
        .otp-row {
          display: flex;
          gap: 0.6rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .otp-box {
          width: 48px; height: 56px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text);
          font-family: var(--mono); font-size: 1.4rem; font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
          caret-color: var(--green);
        }
        .otp-box:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px var(--green-glow);
        }
        .otp-box.otp-filled {
          border-color: var(--green-dim);
          background: rgba(61, 214, 140, 0.05);
        }
        .otp-box.otp-error {
          border-color: var(--red);
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          25%{transform:translateX(-4px)}
          75%{transform:translateX(4px)}
        }

        .resend-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.25rem;
          font-family: var(--mono); font-size: 0.72rem;
          color: var(--text-muted);
        }
        .resend-btn {
          background: none; border: none;
          color: var(--green); font-family: var(--mono);
          font-size: 0.72rem; cursor: pointer;
          transition: opacity 0.2s;
          padding: 0;
        }
        .resend-btn:disabled { color: var(--text-muted); cursor: not-allowed; opacity: 0.6; }

        @media (max-width: 380px) {
          .otp-box { width: 40px; height: 48px; font-size: 1.2rem; }
        }
      `}</style>
    </AuthShell>
  );
}
