"use client";
// Shared shell/layout for all auth pages
// Wrap every auth page with <AuthShell title="..." subtitle="...">...</AuthShell>

import { useEffect, useState } from "react";

export default function AuthShell({ children, title, subtitle }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={`auth-root ${mounted ? "mounted" : ""}`}>
      {/* Animated background grid */}
      <div className="grid-bg" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="grid-cell" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>

      {/* Snake/terminal accent */}
      <div className="corner-mark" aria-hidden="true">
        <span className="corner-line">python9ja</span>
        <span className="cursor-blink">_</span>
      </div>

      <main className="auth-card">
        <div className="brand">
          <div className="brand-logo">
            <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.svg"
              alt="Python 9ja"
              className="w-8 h-8 rounded-lg"
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
            <span className={`font-display font-bold text-lg text-green-800 `}>
              Python<span className="text-green-500">9ja</span>
            </span>
          </div>

          </div>
          <p className="brand-tagline">Nigeria&apos;s Python Community</p>
        </div>

        <div className="card-header">
          <h1 className="card-title">{title}</h1>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>

        {children}
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080c10;
          --surface: #0f1419;
          --surface-2: #161c24;
          --border: #1e2832;
          --border-hover: #2d3d50;
          --green: #3dd68c;
          --green-dim: #1a5c3d;
          --green-glow: rgba(61, 214, 140, 0.15);
          --yellow: #f5c842;
          --red: #e05c5c;
          --text: #e8f0f8;
          --text-muted: #5a7080;
          --text-dim: #8aa0b0;
          --mono: 'JetBrains Mono', monospace;
          --sans: 'Syne', sans-serif;
          --radius: 6px;
          --radius-lg: 12px;
        }

        html, body { height: 100%; background: var(--bg); }

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: var(--sans);
          position: relative;
          overflow: hidden;
        }

        /* --- Grid background --- */
        .grid-bg {
          position: fixed; inset: 0;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-template-rows: repeat(4, 1fr);
          pointer-events: none;
          z-index: 0;
        }
        .grid-cell {
          border: 1px solid rgba(61, 214, 140, 0.03);
          opacity: 0;
          animation: cellFade 0.6s forwards;
        }
        @keyframes cellFade { to { opacity: 1; } }

        /* --- Corner terminal mark --- */
        .corner-mark {
          position: fixed; bottom: 1.5rem; right: 1.5rem;
          font-family: var(--mono); font-size: 0.65rem;
          color: var(--text-muted);
          display: flex; align-items: center; gap: 2px;
          letter-spacing: 0.05em; z-index: 10;
        }
        .cursor-blink { animation: blink 1.1s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* --- Card --- */
        .auth-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 440px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2.5rem 2rem;
          box-shadow: 0 0 0 1px rgba(61,214,140,0.04), 0 24px 48px rgba(0,0,0,0.6);
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .mounted .auth-card { opacity: 1; transform: translateY(0); }

        /* --- Brand --- */
        .brand { text-align: center; margin-bottom: 1.75rem; }
        .brand-logo {
          display: inline-flex; align-items: baseline; gap: 2px;
          font-family: var(--mono); font-size: 1.9rem; font-weight: 700;
          line-height: 1;
        }
        .logo-py { color: var(--green); }
        .logo-9ja { color: var(--yellow); }
        .brand-tagline {
          margin-top: 0.35rem;
          font-family: var(--mono); font-size: 0.65rem;
          color: var(--text-muted); letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* --- Card header --- */
        .card-header { margin-bottom: 1.75rem; }
        .card-title {
          font-size: 1.35rem; font-weight: 700;
          color: var(--text); letter-spacing: -0.01em;
        }
        .card-subtitle {
          margin-top: 0.35rem; font-size: 0.82rem;
          color: var(--text-dim); font-family: var(--mono);
        }

        /* --- Form elements --- */
        .field { margin-bottom: 1rem; }
        .field label {
          display: block; margin-bottom: 0.4rem;
          font-family: var(--mono); font-size: 0.7rem;
          color: var(--text-muted); letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .field input {
          width: 100%; padding: 0.65rem 0.85rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text); font-family: var(--mono); font-size: 0.875rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
        }
        .field input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px var(--green-glow);
        }
        .field input::placeholder { color: var(--text-muted); }
        .field input.error-input { border-color: var(--red); }
        .field-error {
          margin-top: 0.3rem; font-family: var(--mono);
          font-size: 0.7rem; color: var(--red);
        }

        /* --- Buttons --- */
        .btn-primary {
          width: 100%; padding: 0.75rem;
          background: var(--green); color: #060c0a;
          border: none; border-radius: var(--radius);
          font-family: var(--mono); font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.05em; cursor: pointer;
          transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
          margin-top: 0.5rem;
        }
        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
          box-shadow: 0 0 16px var(--green-glow);
        }
        .btn-primary:active:not(:disabled) { transform: scale(0.99); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-ghost {
          width: 100%; padding: 0.65rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-dim); font-family: var(--mono);
          font-size: 0.8rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .btn-ghost:hover {
          border-color: var(--border-hover);
          background: var(--surface-2); color: var(--text);
        }

        /* --- Divider --- */
        .divider {
          display: flex; align-items: center; gap: 0.75rem;
          margin: 1.25rem 0;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }
        .divider span {
          font-family: var(--mono); font-size: 0.65rem;
          color: var(--text-muted); letter-spacing: 0.08em;
          white-space: nowrap;
        }

        /* --- OAuth buttons row --- */
        .oauth-row { display: flex; gap: 0.75rem; margin-bottom: 0; }
        .oauth-row .btn-ghost { flex: 1; }

        /* --- Footer link --- */
        .auth-footer {
          margin-top: 1.5rem; text-align: center;
          font-family: var(--mono); font-size: 0.75rem; color: var(--text-muted);
        }
        .auth-footer a {
          color: var(--green); text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .auth-footer a:hover { border-color: var(--green); }

        /* --- Alert banner --- */
        .alert {
          padding: 0.65rem 0.85rem; border-radius: var(--radius);
          font-family: var(--mono); font-size: 0.75rem;
          margin-bottom: 1rem;
        }
        .alert-error { background: rgba(224,92,92,0.1); border: 1px solid rgba(224,92,92,0.3); color: var(--red); }
        .alert-success { background: rgba(61,214,140,0.08); border: 1px solid rgba(61,214,140,0.25); color: var(--green); }

        /* --- Loading spinner --- */
        .spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(6,12,10,0.3);
          border-top-color: #060c0a;
          animation: spin 0.6s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .auth-card { padding: 2rem 1.25rem; }
          .oauth-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
