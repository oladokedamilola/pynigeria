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


export default function JobCard({ job, bookmarked, onBookmark }) {
  return (
    <div className="job-card group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 transition-all duration-200 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover rounded-xl" />
            ) : "🏢"}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">{job.company || "Company"}</p>
            <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">
              {job.job_title}
            </h3>
          </div>
        </div>
        <button
          onClick={() => onBookmark(job.slug)}
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${bookmarked ? "bg-emerald-100 text-emerald-600" : "bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500"}`}
          title={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          {bookmarked ? "🔖" : "📑"}
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {job.employment_type && (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            {job.employment_type}
          </span>
        )}
        {job.tags?.slice(0, 3).map((tag) => (
          <span key={tag.name || tag} className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
            {tag.name || tag}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
     {job.location && <span className="flex items-center gap-1">📍 {job.location}</span>}
        {job.salary && <span className="flex items-center gap-1">💰 {job.salary}</span>}
        <span className="ml-auto">{timeAgo(job.created_at)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        {job.is_approved ? (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">✅ Verified</span>
        ) : (
          <span className="text-xs text-amber-500 font-medium flex items-center gap-1">⏳ Pending</span>
        )}
        <Link
          href={`/jobs/${job.slug}`}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}