import Link from "next/link"

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function JobCard({ job, bookmarked, onBookmark, listMode }) {
  return (
    <div className={`job-card-dark ${listMode ? "list-mode" : ""}`}>
      {/* Logo + Title */}
      <div className={`flex items-start gap-3 ${listMode ? "flex-shrink-0 w-56" : ""}`}>
        <div className="logo-box">
          {job.company_logo
            ? <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover rounded-[10px]" />
            : "🏢"}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-mono text-muted truncate">{job.company || "Company"}</p>
          <h3 className="font-display font-semibold text-white text-sm leading-tight mt-0.5 group-hover:text-green truncate">
            {job.job_title}
          </h3>
        </div>
        {!listMode && (
          <button
            onClick={() => onBookmark(job.slug)}
            className={`ml-auto flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
              bookmarked
                ? "bg-green/10 text-green border border-green/25"
                : "bg-transparent text-muted border border-[#2a2a2a] hover:border-green/30 hover:text-green"
            }`}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {bookmarked ? "🔖" : "📑"}
          </button>
        )}
      </div>

      {/* Tags */}
      <div className={`flex flex-wrap gap-1.5 ${listMode ? "flex-1" : ""}`}>
        {job.employment_type && <span className="tag-chip">{job.employment_type}</span>}
        {job.tags?.slice(0, 3).map((tag) => (
          <span key={tag.name || tag} className="tag-neutral">{tag.name || tag}</span>
        ))}
      </div>

      {/* Meta row */}
      <div className={`flex items-center gap-3 ${listMode ? "flex-shrink-0" : ""}`}>
        {job.location && <span className="flex items-center gap-1 text-[10px] font-mono text-muted">📍 {job.location}</span>}
        {job.salary && <span className="flex items-center gap-1 text-[10px] font-mono text-green font-semibold">💰 {job.salary}</span>}
        {!listMode && <span className="ml-auto text-[10px] font-mono text-muted">{timeAgo(job.created_at)}</span>}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-2 border-t border-[#1e1e1e] ${listMode ? "flex-shrink-0" : ""}`}>
        {job.is_approved
          ? <span className="text-[10px] font-semibold text-green flex items-center gap-1">✅ Verified</span>
          : <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">⏳ Pending</span>
        }
        <Link
          href={`/jobs/${job.slug}`}
          className="text-[11px] font-bold text-green hover:opacity-75 transition-opacity flex items-center gap-1 font-display"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
