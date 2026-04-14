"use client";
import { useState } from "react";
import { MapPin, Github, Globe, MessageCircle, ExternalLink, Edit, Briefcase, FileText, ChevronRight, Calendar, ArrowLeft } from "lucide-react";
import "@/styles/profile-detail.css"
import {getProfile} from "@/lib/api"
import { useParams } from "next/navigation";
// Mock user data
const MOCK_USER = {
  id: "1", username: "loulou", full_name:"Mustapha Awwal",  
  bio: "Full-stack Django developer building fintech solutions across West Africa. Open source contributor. Python 9ja core member. I believe clean APIs are love letters to future developers.",
  avatar: null, location: "Lagos, Nigeria", experience_level: "senior",
  skills: ["Django", "React", "PostgreSQL", "Docker", "Redis", "Celery", "AWS"],
  github: "https://github.com/", portfolio: "https://loulou.vercel.app", whatsapp_username: "loulou",
  date_joined: "2022-04-12",
};
const MOCK_POSTS = [
  { id: 1, title: "How I built a multi-tenant SaaS with Django", created_at: "2025-03-10", excerpt: "A walkthrough of the architecture decisions that made it scale..." },
  { id: 2, title: "Understanding Python's GIL in 2025", created_at: "2025-01-22", excerpt: "The GIL gets a lot of hate. Here's when it actually matters..." },
  { id: 3, title: "Why I switched from Celery to Django-Q", created_at: "2024-11-05", excerpt: "Performance comparison and lessons learned from production..." },
];
const MOCK_APPLICATIONS = [
  { id: 1, job_title: "Senior Backend Engineer", company: "Flutterwave", status: "In Review", applied_at: "2025-03-28" },
  { id: 2, job_title: "Python Developer", company: "Paystack", status: "Rejected", applied_at: "2025-02-14" },
];

const LEVEL_META = {
  junior: { color: "#8eff71", label: "Junior Dev" },
  mid: { color: "#60a5fa", label: "Mid-level Dev" },
  senior: { color: "#fbbf24", label: "Senior Dev" },
  lead: { color: "#f472b6", label: "Lead Dev" },
  principal: { color: "#a78bfa", label: "Principal Dev" },
};
const STATUS_COLORS = { "In Review": "#fbbf24", Rejected: "#f87171", Accepted: "#8eff71", Applied: "#60a5fa" };

function getInitials(user) {
  if (user.first_name && user.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  return user.username.slice(0, 2).toUpperCase();
}

export default function PublicProfilePage({ params }) {
  // In production: const { id } = params; fetch user from API
  const user = MOCK_USER;
  // const params = useParams();
  // const slug = params?.id;
  const isOwner = true; // Replace with: user.id === currentUser?.id
  const [activeTab, setActiveTab] = useState("posts");
  const level = LEVEL_META[user.experience_level] || LEVEL_META.junior;

  return (
    <>
      <div className="page-wrap">
        <a className="back-link" href="/developers"><ArrowLeft size={13} /> Developer Directory</a>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="header-inner">
            <div className="avatar-wrap">
              <div className="avatar-circle" style={{ background: `${level.color}15`, color: level.color }}>
                {getInitials(user)}
              </div>
              <div className="avatar-ring" style={{ borderColor: level.color }} />
            </div>

            <div className="header-info">
              <h1 className="header-name">{user.full_name}</h1>
              <div className="header-username">@{user.username}</div>

              <div className="header-meta">
                <span className="level-pill" style={{ color: level.color, borderColor: `${level.color}40`, background: `${level.color}10` }}>
                  {level.label}
                </span>
                {user.location && (
                  <span className="meta-item"><MapPin size={13} />{user.location}</span>
                )}
                {user.github && (
                  <a className="meta-item" href={user.github} target="_blank" rel="noopener noreferrer" style={{ cursor: "pointer" }}>
                    {/*<Github size={13} />GitHub <ExternalLink size={10} />*/}
                  </a>
                )}
                {user.portfolio && (
                  <a className="meta-item" href={user.portfolio} target="_blank" rel="noopener noreferrer" style={{ cursor: "pointer" }}>
                    <Globe size={13} />Portfolio <ExternalLink size={10} />
                  </a>
                )}
                {user.whatsapp_username && (
                  <span className="meta-item"><MessageCircle size={13} />{user.whatsapp_username}</span>
                )}
              </div>

              {user.bio && <p className="bio-text">{user.bio}</p>}

              <div className="skills-row">
                {user.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
              </div>

              <p className="joined">Member since {new Date(user.date_joined).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>

            <div className="header-actions">
              {isOwner && (
                <a href="/dashboard/profile"><button className="btn-edit"><Edit size={13} /> Edit Profile</button></a>
              )}
              {user.github && (
                <a href={user.github} target="_blank" rel="noopener noreferrer">
                  {/*<button className="btn-ghost"><Github size={13} /> GitHub</button>*/}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="stats-strip">
          <div className="stat-item">
            <div className="stat-value">{MOCK_POSTS.length}</div>
            <div className="stat-label">Posts</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{user.skills.length}</div>
            <div className="stat-label">Skills</div>
          </div>
          {isOwner && (
            <div className="stat-item">
              <div className="stat-value">{MOCK_APPLICATIONS.length}</div>
              <div className="stat-label">Applications</div>
            </div>
          )}
          <div className="stat-item">
            <div className="stat-value">{user.experience_level}</div>
            <div className="stat-label">Level</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div className={`tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
            Posts ({MOCK_POSTS.length})
          </div>
          {isOwner && (
            <div className={`tab ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>
              Applications ({MOCK_APPLICATIONS.length})
            </div>
          )}
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          MOCK_POSTS.length > 0 ? (
            <div className="post-list">
              {MOCK_POSTS.map(post => (
                <div className="post-card" key={post.id}>
                  <div className="post-icon"><FileText size={15} color="#666" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="post-title">{post.title}</div>
                    <div className="post-excerpt">{post.excerpt}</div>
                    <div className="post-date"><Calendar size={10} />{new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <ChevronRight size={16} className="post-arrow" color="#555" />
                </div>
              ))}
            </div>
          ) : <div className="empty-tab">No posts yet.</div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && isOwner && (
          MOCK_APPLICATIONS.length > 0 ? (
            <div className="app-list">
              {MOCK_APPLICATIONS.map(app => (
                <div className="app-card" key={app.id}>
                  <div className="app-icon"><Briefcase size={15} color="#666" /></div>
                  <div style={{ flex: 1 }}>
                    <div className="app-title">{app.job_title}</div>
                    <div className="app-company">{app.company}</div>
                    <div className="app-date">{new Date(app.applied_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <div className="status-badge" style={{
                    color: STATUS_COLORS[app.status] || "#888",
                    borderColor: `${STATUS_COLORS[app.status] || "#888"}40`,
                    background: `${STATUS_COLORS[app.status] || "#888"}10`,
                  }}>{app.status}</div>
                </div>
              ))}
            </div>
          ) : <div className="empty-tab">No applications yet.</div>
        )}
      </div>
    </>
  );
}
