"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getJobs } from "@/lib/api";
import JobCard from "@/components/cards/JobCard";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Remote"];
const SORT_OPTIONS = [
  { label: "Newest First", value: "-created_at" },
  { label: "Job Title A–Z", value: "job_title" },
  { label: "Salary", value: "salary" },
];

const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior", "Lead / Manager"];

/* ─── Tiny reusable pill ─── */
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`filter-pill w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
        active ? "pill-active" : "pill-idle"
      }`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? "dot-active" : "dot-idle"}`} />
      {label}
    </button>
  );
}

/* ─── Sidebar section wrapper ─── */
function SideSection({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-green mb-2 opacity-70">{title}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

/* ─── Quick-stat card ─── */
function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card rounded-xl p-3 flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experience, setExperience] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (employmentType) params.set("employment_type", employmentType);
      if (ordering) params.set("ordering", ordering);
      params.set("page", page);
      const res = await getJobs(params);
      if (Array.isArray(res)) {
        setJobs(res);
        setPagination({ count: res.length, next: null, previous: null });
      } else {
        setJobs(res.results || []);
        setPagination({ count: res.count || 0, next: res.next, previous: res.previous });
      }
    } catch {
      setError("Could not load jobs. Make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  }, [search, employmentType, ordering, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const toggleBookmark = (slug) => {
    if (!isLoggedIn) { window.location.href = "/login"; return; }
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const totalPages = Math.ceil(pagination.count / 10);
  const hasActiveFilters = search || employmentType || experience;

  return (
    <div className="jobs-root min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

        :root {
          --bg:       #0e0e0e;
          --surface:  #161616;
          --border:   #242424;
          --green:    #8eff71;
          --green-dim:#4ebb38;
          --muted:    #555;
          --text:     #e8e8e8;
          --text-dim: #888;
        }

        .jobs-root {
          background: var(--bg);
          color: var(--text);
          font-family: 'Instrument Sans', sans-serif;
        }

        /* ── Typography ── */
        .font-display { font-family: 'Syne', sans-serif; }
        .font-mono    { font-family: 'DM Mono', monospace; }
        .text-green   { color: var(--green); }
        .text-muted   { color: var(--text-dim); }

        /* ── Hero (UNCHANGED — kept exactly as provided) ── */
        .green-gradient { background: linear-gradient(135deg, #065f46 0%, #059669 60%, #34d399 100%); }
        .btn-green { background: linear-gradient(135deg, #065f46, #059669); transition: all 0.2s; }
        .btn-green:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(5,150,105,0.3); }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .search-focus:focus { outline: none; border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.1); }

        /* ── Surfaces ── */
        .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        /* ── Filter pills ── */
        .pill-active {
          background: rgba(142,255,113,0.12);
          color: var(--green);
          border: 1px solid rgba(142,255,113,0.3);
        }
        .pill-idle {
          background: transparent;
          color: var(--text-dim);
          border: 1px solid transparent;
        }
        .pill-idle:hover {
          border-color: var(--border);
          color: var(--text);
          background: rgba(255,255,255,0.03);
        }
        .dot-active { background: var(--green); }
        .dot-idle   { background: var(--muted); }

        /* ── Stat cards (right panel) ── */
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
        }

        /* ── Tag chips ── */
        .tag-chip {
          background: rgba(142,255,113,0.07);
          color: var(--green);
          border: 1px solid rgba(142,255,113,0.18);
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          font-family: 'DM Mono', monospace;
        }
        .tag-neutral {
          background: rgba(255,255,255,0.04);
          color: var(--text-dim);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          font-family: 'DM Mono', monospace;
        }

        /* ── Job card (dark version) ── */
        .job-card-dark {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: all 0.2s;
          cursor: pointer;
          animation: fadeUp 0.4s ease forwards;
        }
        .job-card-dark:hover {
          border-color: rgba(142,255,113,0.35);
          box-shadow: 0 0 0 1px rgba(142,255,113,0.12), 0 8px 32px rgba(0,0,0,0.4);
          transform: translateY(-2px);
        }
        .job-card-dark.list-mode {
          flex-direction: row;
          align-items: center;
          gap: 16px;
        }

        /* ── Company logo box ── */
        .logo-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(142,255,113,0.08);
          border: 1px solid rgba(142,255,113,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        /* ── View toggle ── */
        .view-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.15s;
          background: transparent;
          color: var(--text-dim);
        }
        .view-btn.active {
          background: rgba(142,255,113,0.1);
          border-color: rgba(142,255,113,0.3);
          color: var(--green);
        }

        /* ── Search bar (below hero) ── */
        .search-bar {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          color: var(--text);
          font-size: 13px;
          width: 100%;
          transition: all 0.2s;
        }
        .search-bar:focus {
          outline: none;
          border-color: rgba(142,255,113,0.4);
          box-shadow: 0 0 0 3px rgba(142,255,113,0.06);
        }
        .search-bar::placeholder { color: var(--muted); }

        /* ── Green CTA button ── */
        .cta-btn {
          background: var(--green);
          color: #0e0e0e;
          font-weight: 700;
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 12px;
          transition: all 0.15s;
          border: none;
          cursor: pointer;
          white-space: nowrap;
        }
        .cta-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Ghost button ── */
        .ghost-btn {
          background: transparent;
          color: var(--green);
          font-weight: 600;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 12px;
          border: 1px solid rgba(142,255,113,0.3);
          cursor: pointer;
          transition: all 0.15s;
        }
        .ghost-btn:hover {
          background: rgba(142,255,113,0.08);
        }

        /* ── Active filter tag ── */
        .active-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(142,255,113,0.1);
          border: 1px solid rgba(142,255,113,0.2);
          font-size: 11px;
          font-weight: 600;
          color: var(--green);
        }

        /* ── Skeleton ── */
        .skeleton-dark {
          background: linear-gradient(90deg, #1c1c1c 25%, #222 50%, #1c1c1c 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── Pagination ── */
        .page-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-dim);
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .page-btn:hover:not(:disabled) {
          border-color: rgba(142,255,113,0.3);
          color: var(--green);
        }
        .page-btn.current {
          background: var(--green);
          color: #0e0e0e;
          border-color: var(--green);
        }
        .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .page-arrow {
          padding: 0 12px;
          width: auto;
        }

        /* ── Right panel accent items ── */
        .accent-item {
          border-left: 2px solid rgba(142,255,113,0.3);
          padding-left: 10px;
        }

        /* ── Section divider ── */
        .divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 16px 0;
        }

        /* ── Trending tag ── */
        .trend-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          color: var(--text-dim);
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Mono', monospace;
        }
        .trend-tag:hover {
          border-color: rgba(142,255,113,0.3);
          color: var(--green);
          background: rgba(142,255,113,0.05);
        }

        /* ── Post job CTA panel ── */
        .post-job-panel {
          background: linear-gradient(135deg, rgba(142,255,113,0.08) 0%, rgba(5,150,105,0.12) 100%);
          border: 1px solid rgba(142,255,113,0.2);
          border-radius: 12px;
          padding: 18px;
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO BANNER — UNCHANGED AS REQUESTED
      ══════════════════════════════════════════ */}
      <br />
      <br />
      <div className="green-gradient py-14 px-4">
        <div className="max-w-4xl mx-auto text-center fade-up">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            {pagination.count > 0 ? `${pagination.count} Python jobs available` : "Python Jobs Board"}
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-3">Find Your Next Python Role</h1>
          <p className="text-emerald-100 text-base mb-8 max-w-lg mx-auto">
            Curated jobs for Python developers, data scientists, and ML engineers across Nigeria and remote.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, skill, or type…"
                className="search-focus w-full pl-10 pr-4 py-3.5 rounded-xl border border-transparent text-sm text-gray-800 bg-white shadow-md"
              />
            </div>
            <button type="submit" className="px-5 py-3.5 rounded-xl bg-emerald-900 text-white font-semibold text-sm hover:bg-emerald-800 transition-colors shadow-md">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN DASHBOARD LAYOUT
      ══════════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-5">

          {/* ── LEFT: Filters Sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-0 w-56 flex-shrink-0">
            <div className="panel p-5 sticky top-20">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="font-display font-bold text-sm text-white">Filters</span>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setSearch(""); setSearchInput(""); setEmploymentType(""); setExperience(""); setPage(1); }}
                    className="text-[10px] font-semibold text-green opacity-70 hover:opacity-100 transition-opacity"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Sort By */}
              <SideSection title="Sort By">
                {SORT_OPTIONS.map((opt) => (
                  <FilterPill
                    key={opt.value}
                    label={opt.label}
                    active={ordering === opt.value}
                    onClick={() => { setOrdering(opt.value); setPage(1); }}
                  />
                ))}
              </SideSection>

              <hr className="divider" />

              {/* Job Type */}
              <SideSection title="Job Type">
                <FilterPill label="All Types" active={!employmentType} onClick={() => { setEmploymentType(""); setPage(1); }} />
                {EMPLOYMENT_TYPES.map((t) => (
                  <FilterPill key={t} label={t} active={employmentType === t} onClick={() => { setEmploymentType(t); setPage(1); }} />
                ))}
              </SideSection>

              <hr className="divider" />

              {/* Experience */}
              <SideSection title="Experience">
                <FilterPill label="All Levels" active={!experience} onClick={() => setExperience("")} />
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <FilterPill key={lvl} label={lvl} active={experience === lvl} onClick={() => setExperience(lvl)} />
                ))}
              </SideSection>

              {isLoggedIn && (
                <>
                  <hr className="divider" />
                  <Link
                    href="/jobs/bookmarks"
                    className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-green transition-colors py-1"
                  >
                    <span>🔖</span> My Bookmarks
                  </Link>
                </>
              )}
            </div>
          </aside>

          {/* ── CENTER: Job Grid ── */}
          <main className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Toolbar */}
            <div className="panel px-4 py-3 flex items-center gap-3 flex-wrap">
              {/* Inline search (desktop supplement) */}
              <div className="flex-1 min-w-[160px]">
                <form onSubmit={handleSearch} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs">🔍</span>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Refine search…"
                    className="search-bar pl-8 pr-3 py-2"
                  />
                </form>
              </div>

              {/* Result count */}
              <span className="font-mono text-xs text-muted hidden sm:block">
                {loading ? "—" : `${pagination.count} result${pagination.count !== 1 ? "s" : ""}`}
              </span>

              {/* View toggle */}
              <div className="flex items-center gap-1">
                <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")} title="Grid view">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="0" y="0" width="6" height="6" rx="1.5"/>
                    <rect x="8" y="0" width="6" height="6" rx="1.5"/>
                    <rect x="0" y="8" width="6" height="6" rx="1.5"/>
                    <rect x="8" y="8" width="6" height="6" rx="1.5"/>
                  </svg>
                </button>
                <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")} title="List view">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="0" y="0" width="14" height="2.5" rx="1.2"/>
                    <rect x="0" y="5.5" width="14" height="2.5" rx="1.2"/>
                    <rect x="0" y="11" width="14" height="2.5" rx="1.2"/>
                  </svg>
                </button>
              </div>

              {!isLoggedIn && (
                <Link href="/jobs/post">
                  <button className="cta-btn font-display">+ Post a Job</button>
                </Link>
              )}
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">Active:</span>
                {search && (
                  <span className="active-filter-tag">
                    🔍 "{search}"
                    <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="opacity-60 hover:opacity-100 ml-1">✕</button>
                  </span>
                )}
                {employmentType && (
                  <span className="active-filter-tag">
                    {employmentType}
                    <button onClick={() => { setEmploymentType(""); setPage(1); }} className="opacity-60 hover:opacity-100 ml-1">✕</button>
                  </span>
                )}
                {experience && (
                  <span className="active-filter-tag">
                    {experience}
                    <button onClick={() => setExperience("")} className="opacity-60 hover:opacity-100 ml-1">✕</button>
                  </span>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="panel px-4 py-3 border-red-900/40 bg-red-950/30 text-red-400 text-sm flex items-center gap-2">
                ⚠️ {error}
                <button onClick={fetchJobs} className="ml-auto text-xs font-bold underline">Retry</button>
              </div>
            )}

            {/* Skeleton */}
            {loading && (
              <div className={`grid gap-4 ${viewMode === "grid" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="panel p-5 space-y-3">
                    <div className="flex gap-3">
                      <div className="skeleton-dark w-11 h-11 rounded-xl" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="skeleton-dark h-2.5 w-20 rounded" />
                        <div className="skeleton-dark h-3.5 w-36 rounded" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="skeleton-dark h-5 w-16 rounded-md" />
                      <div className="skeleton-dark h-5 w-12 rounded-md" />
                      <div className="skeleton-dark h-5 w-14 rounded-md" />
                    </div>
                    <div className="skeleton-dark h-2.5 w-28 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && jobs.length === 0 && (
              <div className="panel flex flex-col items-center py-20 text-center">
                <div className="text-5xl mb-4 opacity-40">🐍</div>
                <h3 className="font-display font-bold text-xl text-white mb-2">No jobs found</h3>
                <p className="text-muted text-sm mb-6">Try a different search term or clear your filters</p>
                <button onClick={() => { setSearch(""); setSearchInput(""); setEmploymentType(""); setExperience(""); setPage(1); }} className="cta-btn">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Job Cards — dark JobCard wrapper */}
            {!loading && jobs.length > 0 && (
              <div className={`grid gap-4 ${viewMode === "grid" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {jobs.map((job, i) => (
                  <div key={job.slug || i} style={{ animationDelay: `${i * 0.04}s` }}>
                    <JobCard job={job} bookmarked={bookmarks.has(job.slug)} onBookmark={toggleBookmark} listMode={viewMode === "list"} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <button className="page-btn page-arrow" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`page-btn ${page === p ? "current" : ""}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                {totalPages > 5 && <span className="text-muted text-xs px-1">…</span>}
                <button className="page-btn page-arrow" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
              </div>
            )}
          </main>

          {/* ── RIGHT: Info Panel ── */}
          <aside className="hidden xl:flex flex-col gap-4 w-60 flex-shrink-0">

            {/* Quick stats */}
            <div className="panel p-5">
              <p className="font-display font-bold text-sm text-white mb-4">Community Stats</p>
              <div className="flex flex-col gap-2">
                <StatCard icon="🐍" label="Active Jobs" value={loading ? "—" : `${pagination.count}`} />
                <StatCard icon="👥" label="Members" value="2,000+" />
                <StatCard icon="🇳🇬" label="Nigerian + Remote" value="100% Focused" />
              </div>
            </div>

            {/* Post a job CTA */}
            {!isLoggedIn && (
              <div className="post-job-panel">
                <p className="font-display font-bold text-sm text-green mb-1">Hiring Python talent?</p>
                <p className="text-xs text-muted mb-4 leading-relaxed">Reach 2,000+ vetted Python developers in Nigeria and beyond.</p>
                <Link href="/jobs/post">
                  <button className="cta-btn w-full font-display text-center">Post a Job →</button>
                </Link>
              </div>
            )}

            {/* Trending skills */}
            <div className="panel p-5">
              <p className="font-display font-bold text-sm text-white mb-3">Trending Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {["Django", "FastAPI", "ML", "Pandas", "PostgreSQL", "Docker", "NumPy", "DRF", "Celery", "Redis"].map((skill) => (
                  <button
                    key={skill}
                    onClick={() => { setSearchInput(skill); setSearch(skill); setPage(1); }}
                    className="trend-tag"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Recently posted */}
            {!loading && jobs.length > 0 && (
              <div className="panel p-5">
                <p className="font-display font-bold text-sm text-white mb-3">Latest Listings</p>
                <div className="flex flex-col gap-3">
                  {jobs.slice(0, 4).map((job, i) => (
                    <Link key={i} href={`/jobs/${job.slug}`} className="accent-item hover:border-green transition-colors group">
                      <p className="text-xs font-semibold text-white group-hover:text-green transition-colors leading-tight">{job.job_title}</p>
                      <p className="text-[10px] text-muted mt-0.5">{job.company || "Company"} · {job.employment_type || ""}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Python 9ja link */}
            <div className="panel p-4 flex items-center justify-between">
              <span className="font-display text-xs font-bold text-green">Python 9ja</span>
              <a href="https://pynigeria.vercel.app" target="_blank" rel="noreferrer" className="text-[10px] text-muted hover:text-green transition-colors font-mono">pynigeria.vercel.app ↗</a>
            </div>
          </aside>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] mt-10 py-8">
        <div className="max-w-[1280px] mx-auto px-4 text-center text-xs text-muted">
          <Link href="/" className="text-green hover:opacity-80 transition-opacity font-semibold">← Back to home</Link>
        </div>
      </footer>
    </div>
  );
}