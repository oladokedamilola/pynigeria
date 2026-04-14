"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Briefcase, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import "@/styles/profile.css"
import {getAllProfile} from "@/lib/api"

// Mock data for demonstration
const MOCK_DEVELOPERS = [
  { id: "1", username: "loulou", first_name: "Awwal", last_name: "Mustapha", bio: "Full-stack Django dev building fintech solutions across West Africa.", avatar: null, location: "Lagos, Nigeria", experience_level: "intermediate", skills: ["Django", "React", "PostgreSQL", "Docker"], github: "https://github.com", portfolio: "https://portfolio.dev" },
  { id: "2", username: "chukwuemeka_dev", first_name: "Chukwuemeka", last_name: "Eze", bio: "ML engineer passionate about NLP for African languages.", avatar: null, location: "Abuja, Nigeria", experience_level: "mid", skills: ["Python", "TensorFlow", "FastAPI", "Redis"], github: "https://github.com", portfolio: null },
  { id: "3", username: "funmilayo_tech", first_name: "Funmilayo", last_name: "Adesanya", bio: "Backend engineer. I make APIs that don't lie.", avatar: null, location: "Port Harcourt, Nigeria", experience_level: "junior", skills: ["Django", "DRF", "PostgreSQL"], github: "https://github.com", portfolio: "https://portfolio.dev" },
  { id: "4", username: "ibrahim_builds", first_name: "Ibrahim", last_name: "Musa", bio: "DevOps & cloud infrastructure for startups. AWS certified.", avatar: null, location: "Kano, Nigeria", experience_level: "lead", skills: ["AWS", "Kubernetes", "Terraform", "Python"], github: "https://github.com", portfolio: null },
  { id: "5", username: "ngozi_fullstack", first_name: "Ngozi", last_name: "Nwosu", bio: "Turning designs into pixel-perfect full-stack apps.", avatar: null, location: "Enugu, Nigeria", experience_level: "mid", skills: ["Next.js", "Django", "Tailwind", "TypeScript"], github: "https://github.com", portfolio: "https://portfolio.dev" },
  { id: "6", username: "tunde_py", first_name: "Tunde", last_name: "Adeleke", bio: "Data scientist helping businesses make sense of their numbers.", avatar: null, location: "Lagos, Nigeria", experience_level: "senior", skills: ["Python", "Pandas", "Sklearn", "FastAPI"], github: "https://github.com", portfolio: "https://portfolio.dev" },
  { id: "7", username: "amaka_codes", first_name: "Amaka", last_name: "Nze", bio: "Open source contributor. Community builder. Python enthusiast.", avatar: null, location: "Ibadan, Nigeria", experience_level: "mid", skills: ["Python", "Flask", "React", "MySQL"], github: "https://github.com", portfolio: null },
  { id: "8", username: "emeka_ml", first_name: "Emeka", last_name: "Obi", bio: "Computer vision engineer. If it has pixels, I can train on it.", avatar: null, location: "Lagos, Nigeria", experience_level: "principal", skills: ["Python", "PyTorch", "OpenCV", "CUDA"], github: "https://github.com", portfolio: "https://portfolio.dev" },
];

const SKILLS_OPTIONS = ["Django", "React", "Python", "FastAPI", "Next.js", "PostgreSQL", "AWS", "Docker", "TensorFlow", "TypeScript"];
const EXPERIENCE_OPTIONS = ["junior", "mid", "senior", "lead", "principal"];
const LEVEL_COLORS = {
  junior: { bg: "rgba(142, 255, 113, 0.12)", text: "#8eff71", border: "rgba(142, 255, 113, 0.25)" },
  mid: { bg: "rgba(96, 165, 250, 0.12)", text: "#60a5fa", border: "rgba(96, 165, 250, 0.25)" },
  senior: { bg: "rgba(251, 191, 36, 0.12)", text: "#fbbf24", border: "rgba(251, 191, 36, 0.25)" },
  lead: { bg: "rgba(244, 114, 182, 0.12)", text: "#f472b6", border: "rgba(244, 114, 182, 0.25)" },
  principal: { bg: "rgba(167, 139, 250, 0.12)", text: "#a78bfa", border: "rgba(167, 139, 250, 0.25)" },
};

function getInitials(user) {
  if (user.first_name && user.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  return user.username.slice(0, 2).toUpperCase();
}

function AvatarInitials({ user, size = 56 }) {
  const colors = ["#8eff71", "#60a5fa", "#fbbf24", "#f472b6", "#a78bfa"];
  const colorIdx = user.username.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${colors[colorIdx]}18`,
      border: `1.5px solid ${colors[colorIdx]}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: size * 0.33, fontWeight: 700,
      color: colors[colorIdx], flexShrink: 0,
    }}>
      {getInitials(user)}
    </div>
  );
}

function UserCard({ user }) {
  const level = LEVEL_COLORS[user.experience_level] || LEVEL_COLORS.junior;
  
  const checkSkills =(skills)=>{
    if(Array.isArray(skills)){
      return skills
    }
    else{
      return skills.split(",")
    }
  }

  return (
    <a href={`/profile/${user.id}`} style={{ textDecoration: "none" }}>
      <div className="user-card">
        <div className="card-top">
          <AvatarInitials user={user} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="card-name">{user.full_name ? user.full_name : `${user.first_name} ${user.last_name}`}</span>
              <span className="level-badge" style={{ background: level.bg, color: level.text, border: `1px solid ${level.border}` }}>
                {user.experience_level}
              </span>
            </div>
            <span className="card-username">@{user.username}</span>
          </div>
        </div>
        {user.bio && <p className="card-bio">{user.bio}</p>}
        {user.location && (
          <div className="card-location">
            <MapPin size={11} />
            <span>{user.location}</span>
          </div>
        )}
        <div className="card-skills">
          {checkSkills(user.skills).slice(0, 4).map(s => (
            <span key={s} className="skill-chip">{s}</span>
          ))}
          {user.skills.length > 4 && <span className="skill-more">+{user.skills.length - 4}</span>}
        </div>
        <div className="card-footer">
          <span className="view-profile">View Profile →</span>
        </div>
      </div>
    </a>
  );
}

export default function DeveloperDirectory() {
  const [developers, setDevelopers] = useState(MOCK_DEVELOPERS);
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const PER_PAGE = 6;

  const filtered = developers.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.username.toLowerCase().includes(q) ||
      d.first_name.toLowerCase().includes(q) || d.last_name.toLowerCase().includes(q) ||
      d.bio?.toLowerCase().includes(q) || d.skills.some(s => s.toLowerCase().includes(q));
    const matchSkills = selectedSkills.length === 0 || selectedSkills.every(s => d.skills.includes(s));
    const matchLevel = !selectedLevel || d.experience_level === selectedLevel;
    const matchLoc = !location || d.location?.toLowerCase().includes(location.toLowerCase());
    return matchSearch && matchSkills && matchLevel && matchLoc;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedSkills([]); setSelectedLevel(""); setLocation(""); setPage(1);
  };

  const hasFilters = selectedSkills.length > 0 || selectedLevel || location;

  useEffect(async()=>{
    try{
    const data = await getAllProfile();
    setDevelopers(data)}
    catch{

    }
  },[])

  return (
    <>
      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">Developer <span>Directory</span></h1>
          <p className="page-subtitle">Connect with Python developers across Nigeria</p>
        </div>

        <div className="search-row">
          <div className="search-box">
            <Search size={15} color="#666" />
            <input
              placeholder="Search by name, skill, or username..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className={`filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={14} />
            Filters {hasFilters && `(${selectedSkills.length + (selectedLevel ? 1 : 0) + (location ? 1 : 0)})`}
          </button>
        </div>

        <div className="filters-panel">
          <div className="filter-group">
            <div className="filter-label">Skills</div>
            <div className="filter-chips">
              {SKILLS_OPTIONS.map(s => (
                <button key={s} className={`filter-chip ${selectedSkills.includes(s) ? "selected" : ""}`} onClick={() => toggleSkill(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-label">Experience Level</div>
            <div className="filter-chips">
              {EXPERIENCE_OPTIONS.map(l => (
                <button key={l} className={`filter-chip ${selectedLevel === l ? "selected" : ""}`} onClick={() => { setSelectedLevel(prev => prev === l ? "" : l); setPage(1); }}>{l}</button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <div style={{ flex: 1 }}>
              <div className="filter-label">Location</div>
              <input className="filter-input" placeholder="e.g. Lagos, Abuja..." value={location} onChange={e => { setLocation(e.target.value); setPage(1); }} />
            </div>
            {hasFilters && <button className="clear-btn" onClick={clearFilters}>Clear all</button>}
          </div>
        </div>

        {hasFilters && (
          <div className="active-filters">
            {selectedSkills.map(s => (
              <div key={s} className="active-filter-tag">{s} <button onClick={() => toggleSkill(s)}><X size={10} /></button></div>
            ))}
            {selectedLevel && <div className="active-filter-tag">{selectedLevel} <button onClick={() => { setSelectedLevel(""); setPage(1); }}><X size={10} /></button></div>}
            {location && <div className="active-filter-tag">{location} <button onClick={() => { setLocation(""); setPage(1); }}><X size={10} /></button></div>}
          </div>
        )}

        <p className="results-info">Showing <span>{paginated.length}</span> of <span>{filtered.length}</span> developers</p>

        {paginated.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No developers found</div>
            <p className="empty-sub">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid">
            {paginated.map(dev => <UserCard key={dev.id} user={dev} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${page === p ? "current" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </>
  );
}
