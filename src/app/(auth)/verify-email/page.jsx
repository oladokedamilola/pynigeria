"use client";

import { useState } from "react";
import Link from "next/link";
import { verifyEmailBegin } from "@/lib/api";
import AuthShell from "@/components/AuthShell";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function handleResend() {
    if (loading || cooldown > 0) return;
    setLoading(true);
    try {
      await verifyEmailBegin({});
      setResent(true);
      setCooldown(60);
      const t = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) { clearInterval(t); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch {
      // silently fail — don't leak whether email exists
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Check your email." subtitle="# verification link sent">
      <div className="envelope-wrap">
        <div className="envelope" aria-hidden="true">
          <div className="env-flap" />
          <div className="env-body">
            <div className="env-letter">
              <div className="letter-line" />
              <div className="letter-line short" />
              <div className="letter-dot" />
            </div>
          </div>
        </div>
      </div>

      <div className="info-block">
        <p className="info-main">
          We&apos;ve sent a verification link to your email address.
          Click it to activate your account.
        </p>
        <ul className="info-tips">
          <li>
            <span className="tip-icon">⏱</span>
            The link expires in <strong>24 hours</strong>
          </li>
          <li>
            <span className="tip-icon">📂</span>
            Check your <strong>spam or junk</strong> folder too
          </li>
          <li>
            <span className="tip-icon">🔒</span>
            Only click links from <strong>no-reply@python9ja.com</strong>
          </li>
        </ul>
      </div>

      {resent && (
        <div className="alert alert-success">
          ✓ A new verification link has been sent.
        </div>
      )}

      <div className="resend-row">
        <span>Didn&apos;t get it?</span>
        <button
          type="button"
          className="resend-btn"
          onClick={handleResend}
          disabled={loading || cooldown > 0}
        >
          {loading
            ? "Sending…"
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend link"}
        </button>
      </div>

      <p className="auth-footer">
        Wrong email? <Link href="/register">Start over</Link>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <Link href="/login">Back to login</Link>
      </p>

      <style jsx>{`
        /* ── Envelope illustration ── */
        .envelope-wrap {
          display: flex;
          justify-content: center;
          margin: 0.25rem 0 1.75rem;
        }
        .envelope {
          width: 72px; height: 52px;
          position: relative;
          animation: float 3.5s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        .env-flap {
          position: absolute; top: 0; left: 0; right: 0;
          height: 26px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-bottom: none;
          border-radius: 4px 4px 0 0;
          clip-path: polygon(0 0, 50% 55%, 100% 0);
        }
        .env-body {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 38px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 4px 4px;
          display: flex; align-items: center; justify-content: center;
        }
        .env-letter {
          width: 42px; height: 26px;
          background: var(--bg);
          border: 1px solid var(--green-dim);
          border-radius: 2px;
          padding: 5px 6px;
          display: flex; flex-direction: column; gap: 4px;
          position: relative; top: -6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .letter-line {
          height: 2px; background: var(--green-dim); border-radius: 1px;
        }
        .letter-line.short { width: 60%; }
        .letter-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--green);
          margin-top: 1px;
          box-shadow: 0 0 6px var(--green);
        }

        /* ── Info block ── */
        .info-block {
          margin-bottom: 1.25rem;
        }
        .info-main {
          font-family: var(--mono); font-size: 0.8rem;
          color: var(--text-dim); line-height: 1.65;
          margin-bottom: 1rem;
        }
        .info-tips {
          list-style: none;
          display: flex; flex-direction: column; gap: 0.55rem;
        }
        .info-tips li {
          display: flex; align-items: flex-start; gap: 0.6rem;
          font-family: var(--mono); font-size: 0.72rem;
          color: var(--text-muted); line-height: 1.5;
        }
        .tip-icon { flex-shrink: 0; font-size: 0.85rem; }
        .info-tips strong { color: var(--text-dim); font-weight: 600; }

        /* ── Resend ── */
        .resend-row {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; margin-top: 0.75rem;
          font-family: var(--mono); font-size: 0.72rem;
          color: var(--text-muted);
        }
        .resend-btn {
          background: none; border: none;
          color: var(--green); font-family: var(--mono);
          font-size: 0.72rem; cursor: pointer; padding: 0;
          transition: opacity 0.2s;
        }
        .resend-btn:disabled { color: var(--text-muted); cursor: not-allowed; }
      `}</style>
    </AuthShell>
  );
}
