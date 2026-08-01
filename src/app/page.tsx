"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2, MapPin, Tag, Search, Bell, Bookmark, BookmarkCheck,
  Zap, TrendingUp, LayoutGrid, List, SlidersHorizontal,
  MessageSquare, Clock, ChevronUp, Flame, Eye,
  AlertCircle, RefreshCw,
} from "lucide-react";

/* ── Types ─────────────────────────────────────── */
interface GuardianArticle {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  fields?: { trailText?: string; byline?: string; thumbnail?: string };
}
interface Article {
  id: string; title: string; description: string;
  topic: string; topicType: string; date: string;
  readTime: string; author: string; authorInitials: string;
  url: string; comments: number; views: number; engagement: number;
}
interface Topic {
  id: string; name: string; type: string; count: number | null;
}

/* ── Topic Definitions ─────────────────────────── */
const TOPICS_BASE: Omit<Topic, "count">[] = [
  // Companies
  { id: "c1", name: "Tata Group",    type: "company" },
  { id: "c2", name: "Reliance",      type: "company" },
  { id: "c3", name: "Infosys",       type: "company" },
  { id: "c4", name: "Zomato",        type: "company" },
  { id: "c5", name: "Flipkart",      type: "company" },
  { id: "c6", name: "HDFC",          type: "company" },
  // Cities / Regions
  { id: "r1", name: "Bangalore",     type: "region"  },
  { id: "r2", name: "Mumbai",        type: "region"  },
  { id: "r3", name: "Delhi NCR",     type: "region"  },
  { id: "r4", name: "Hyderabad",     type: "region"  },
  { id: "r5", name: "Pune",          type: "region"  },
  // Topics
  { id: "t1", name: "Indian Startups",  type: "topic" },
  { id: "t2", name: "Indian Economy",   type: "topic" },
  { id: "t3", name: "ISRO & Space",     type: "topic" },
  { id: "t4", name: "Fintech & UPI",    type: "topic" },
  { id: "t5", name: "Digital India",    type: "topic" },
  { id: "t6", name: "AI in India",      type: "topic" },
];

const ACTIVITY = [
  { color: "blue",   text: <><strong>Tata Group</strong> headlines dominate your feed</>,          time: "4m ago"  },
  { color: "purple", text: <><strong>5 new stories</strong> added to Indian Startups</>,           time: "22m ago" },
  { color: "green",  text: <><strong>ISRO & Space</strong> has a major update today</>,            time: "1h ago"  },
  { color: "amber",  text: <>Your saved story on <strong>UPI & Fintech</strong> was updated</>,    time: "3h ago"  },
];

/* ── Helpers ───────────────────────────────────── */
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h >>> 0);
}
function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}
function getInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "IN";
}
function transform(raw: GuardianArticle, topic: string, topicType: string): Article {
  const h = hashStr(raw.id);
  const byline = raw.fields?.byline?.replace(/<[^>]+>/g, "") ?? "Staff Reporter";
  return {
    id: raw.id, title: raw.webTitle,
    description: raw.fields?.trailText?.replace(/<[^>]+>/g, "") ?? "",
    topic, topicType,
    date: relativeTime(raw.webPublicationDate),
    readTime: `${3 + (h % 7)} min`,
    author: byline, authorInitials: getInitials(byline),
    url: raw.webUrl,
    comments: 50  + (h % 400),
    views:    800 + (h % 18000),
    engagement: 40 + (h % 55),
  };
}

/* ── API helpers ───────────────────────────────── */
async function fetchArticles(topic: string): Promise<Article[]> {
  const topicData = TOPICS_BASE.find(t => t.name === topic);
  const topicType = topicData?.type ?? "topic";
  const res = await fetch(`/api/news?topic=${encodeURIComponent(topic)}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return (data.response?.results ?? []).map((r: GuardianArticle) => transform(r, topic, topicType));
}
async function fetchCount(topic: string): Promise<number> {
  const res = await fetch(`/api/news?topic=${encodeURIComponent(topic)}&countOnly=true`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.response?.total ?? 0;
}

/* ── Skeleton ──────────────────────────────────── */
function SkeletonCards() {
  return (
    <div className="feed-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-line w-1-3" />
          <div className="skeleton skeleton-line h-lg w-full" />
          <div className="skeleton skeleton-line w-full" />
          <div className="skeleton skeleton-line w-2-3" />
          <div className="skeleton skeleton-line w-1-3" style={{ marginTop: "0.5rem" }} />
        </div>
      ))}
    </div>
  );
}

/* ── Badge icon by type ────────────────────────── */
function BadgeIcon({ type }: { type: string }) {
  if (type === "company") return <Building2 size={10} />;
  if (type === "region")  return <MapPin size={10} />;
  return <Tag size={10} />;
}

/* ── Count badge ───────────────────────────────── */
function CountBadge({ n }: { n: number | null }) {
  if (n === null) return <span className="nav-count">…</span>;
  return <span className="nav-count">{n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n}</span>;
}

/* ── Main ──────────────────────────────────────── */
export default function Home() {
  const [activeTopic, setActiveTopic] = useState<string>("All Stories");
  const [articles,    setArticles]    = useState<Article[]>([]);
  const [topics,      setTopics]      = useState<Topic[]>(
    TOPICS_BASE.map(t => ({ ...t, count: null }))
  );
  const [allCount,    setAllCount]    = useState<number | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [sortBy,      setSortBy]      = useState<"latest" | "trending" | "top">("latest");
  const [bookmarked,  setBookmarked]  = useState<Set<string>>(new Set());

  const loadArticles = useCallback(async (topic: string) => {
    setLoading(true); setError(null);
    try { setArticles(await fetchArticles(topic)); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to load news"); }
    finally { setLoading(false); }
  }, []);

  // Initial load: articles + all counts in parallel
  useEffect(() => {
    loadArticles("All Stories");
    fetchCount("All Stories").then(n => setAllCount(n));
    Promise.all(
      TOPICS_BASE.map(t => fetchCount(t.name).then(n => ({ id: t.id, count: n })))
    ).then(results =>
      setTopics(prev =>
        prev.map(t => ({ ...t, count: results.find(r => r.id === t.id)?.count ?? t.count }))
      )
    );
  }, [loadArticles]);

  useEffect(() => { loadArticles(activeTopic); }, [activeTopic, loadArticles]);

  const sorted = [...articles].sort((a, b) =>
    sortBy === "trending" ? b.views - a.views :
    sortBy === "top"      ? b.engagement - a.engagement : 0
  );

  const totalViews    = articles.reduce((s, a) => s + a.views, 0);
  const avgEngagement = articles.length
    ? Math.round(articles.reduce((s, a) => s + a.engagement, 0) / articles.length) : 0;

  const trending = [...articles]
    .sort((a, b) => b.views - a.views).slice(0, 5)
    .map(a => ({ name: a.title.length > 42 ? a.title.slice(0, 42) + "…" : a.title, count: `${(a.views / 1000).toFixed(1)}k views` }));

  const companies = topics.filter(t => t.type === "company");
  const regions   = topics.filter(t => t.type === "region");
  const topicList = topics.filter(t => t.type === "topic");

  function toggleBookmark(id: string) {
    setBookmarked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <div className="app-wrap">
      <div className="ambient">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><Zap size={16} color="white" /></div>
          <span className="brand-name">Pulse AI</span>
          <span className="brand-badge">India</span>
        </div>

        <button
          className={`nav-btn ${activeTopic === "All Stories" ? "active" : ""}`}
          onClick={() => setActiveTopic("All Stories")}
        >
          <LayoutGrid className="nav-icon" size={16} />
          <span className="nav-label">All Stories</span>
          <CountBadge n={allCount} />
        </button>

        <div className="sidebar-divider" />

        <p className="nav-section-label">Companies</p>
        {companies.map(t => (
          <button key={t.id} className={`nav-btn ${activeTopic === t.name ? "active" : ""}`}
            onClick={() => setActiveTopic(t.name)}>
            <Building2 className="nav-icon" size={15} />
            <span className="nav-label">{t.name}</span>
            <CountBadge n={t.count} />
          </button>
        ))}

        <p className="nav-section-label">Cities & Hubs</p>
        {regions.map(t => (
          <button key={t.id} className={`nav-btn ${activeTopic === t.name ? "active" : ""}`}
            onClick={() => setActiveTopic(t.name)}>
            <MapPin className="nav-icon" size={15} />
            <span className="nav-label">{t.name}</span>
            <CountBadge n={t.count} />
          </button>
        ))}

        <p className="nav-section-label">Topics</p>
        {topicList.map(t => (
          <button key={t.id} className={`nav-btn ${activeTopic === t.name ? "active" : ""}`}
            onClick={() => setActiveTopic(t.name)}>
            <Tag className="nav-icon" size={15} />
            <span className="nav-label">{t.name}</span>
            <CountBadge n={t.count} />
          </button>
        ))}
      </aside>

      {/* ── Main ── */}
      <div className="main">
        <header className="topbar">
          <div className="search-wrap">
            <Search className="search-icon-inner" size={16} />
            <input className="search-input" type="text"
              placeholder="Search India tech, startups, markets…" />
            <div className="search-shortcut">
              <kbd className="kbd">⌘</kbd>
              <kbd className="kbd">K</kbd>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn"><Bell size={17} /><span className="notif-dot" /></button>
            <button className="icon-btn"><Bookmark size={17} /></button>
            <div className="avatar">AM</div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="stats-bar anim-fade-up">
          <div className="stat-item">
            <div className="stat-icon blue"><List size={16} /></div>
            <div>
              <div className="stat-value">{loading ? "…" : articles.length}</div>
              <div className="stat-label">Stories Loaded</div>
            </div>
            <span className="stat-delta">Live</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon purple"><Eye size={16} /></div>
            <div>
              <div className="stat-value">{loading ? "…" : `${(totalViews / 1000).toFixed(0)}k`}</div>
              <div className="stat-label">Est. Reach</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon green"><TrendingUp size={16} /></div>
            <div>
              <div className="stat-value">{loading ? "…" : `${avgEngagement}%`}</div>
              <div className="stat-label">Avg Engagement</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon amber"><Flame size={16} /></div>
            <div>
              <div className="stat-value">{TOPICS_BASE.length}</div>
              <div className="stat-label">Active Topics</div>
            </div>
            <span className="stat-delta">Live</span>
          </div>
        </div>

        <div className="content-layout">
          <div className="feed-area">
            {/* Feed Header */}
            <div className="feed-header anim-fade-up d-1">
              <div className="feed-title-group">
                <h1 className="feed-title">{activeTopic}</h1>
                <p className="feed-subtitle">
                  {loading
                    ? "Fetching latest stories from India…"
                    : `${sorted.length} ${sorted.length === 1 ? "story" : "stories"} ${activeTopic === "All Stories" ? "across the Indian tech ecosystem" : `about ${activeTopic}`}`}
                </p>
              </div>
              <div className="feed-controls">
                {(["latest", "trending", "top"] as const).map(s => (
                  <button key={s} className={`filter-btn ${sortBy === s ? "active" : ""}`}
                    onClick={() => setSortBy(s)}>
                    {s === "latest" && <><Clock size={13} /> Latest</>}
                    {s === "trending" && <><TrendingUp size={13} /> Trending</>}
                    {s === "top" && <><Flame size={13} /> Top</>}
                  </button>
                ))}
                <button className="filter-btn"><SlidersHorizontal size={13} /></button>
              </div>
            </div>

            {/* Feed Content */}
            {loading ? (
              <SkeletonCards />
            ) : error ? (
              <div className="error-state">
                <AlertCircle size={32} />
                <p className="error-title">Couldn't load stories</p>
                <p className="error-sub">{error}</p>
                <button className="retry-btn" onClick={() => loadArticles(activeTopic)}>
                  <RefreshCw size={13} style={{ display:"inline", marginRight:"0.4rem" }} />
                  Retry
                </button>
              </div>
            ) : sorted.length > 0 ? (
              <div className="feed-grid">
                {sorted.map((article, i) => {
                  const isBookmarked = bookmarked.has(article.id);
                  return (
                    <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer"
                      className="card-link">
                      <article className="card anim-fade-up"
                        style={{ animationDelay: `${0.06 + i * 0.06}s` }}>
                        <div className="card-top">
                          <span className={`badge ${article.topicType}`}>
                            <BadgeIcon type={article.topicType} />
                            {article.topic}
                          </span>
                          <div className="card-actions">
                            <button
                              className={`card-icon-btn ${isBookmarked ? "bookmarked" : ""}`}
                              onClick={e => { e.preventDefault(); toggleBookmark(article.id); }}
                            >
                              {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                            </button>
                          </div>
                        </div>
                        <h2 className="card-title">{article.title}</h2>
                        {article.description && <p className="card-desc">{article.description}</p>}
                        <div>
                          <div className="engagement-bar">
                            <div className="engagement-fill" style={{ width: `${article.engagement}%` }} />
                          </div>
                        </div>
                        <div className="card-meta">
                          <div className="meta-author">
                            <div className="author-dot">{article.authorInitials}</div>
                            <span>{article.author}</span>
                          </div>
                          <div className="meta-stat"><MessageSquare size={12} />{article.comments}</div>
                          <span className="meta-dot">·</span>
                          <div className="meta-stat"><Clock size={12} />{article.readTime}</div>
                          <span className="meta-dot">·</span>
                          <div className="meta-stat">{article.date}</div>
                        </div>
                      </article>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state anim-fade-up">
                <div className="empty-icon"><TrendingUp size={26} /></div>
                <p className="empty-title">No stories found</p>
                <p className="empty-sub">No recent updates for this topic. Check back soon.</p>
              </div>
            )}
          </div>

          {/* ── Right Panel ── */}
          <aside className="right-panel">
            {/* India Signal */}
            <div className="anim-slide-in d-1">
              <p className="panel-title">India Signal</p>
              <div className="insight-card">
                <div className="insight-header">
                  <div className="insight-icon"><Zap size={14} color="white" /></div>
                  <span className="insight-label">Today's Pulse</span>
                  <span className="insight-sublabel">Live</span>
                </div>
                <p className="insight-text">
                  India's tech ecosystem is accelerating — ISRO missions, UPI crossing 14B monthly transactions,
                  and a record wave of AI-first startups from Bangalore and Hyderabad are setting the global agenda.
                </p>
                <div className="insight-tags">
                  <span className="insight-tag">#Bharat</span>
                  <span className="insight-tag">#UPI</span>
                  <span className="insight-tag">#ISRO</span>
                  <span className="insight-tag">#StartupIndia</span>
                </div>
              </div>
            </div>

            {/* Trending */}
            <div className="anim-slide-in d-2">
              <p className="panel-title">Trending Now</p>
              <div className="trend-list">
                {trending.length > 0 ? (
                  trending.map((t, i) => (
                    <div key={i} className="trend-item">
                      <span className="trend-rank">{i + 1}</span>
                      <div className="trend-info">
                        <div className="trend-name">{t.name}</div>
                        <div className="trend-count">{t.count}</div>
                      </div>
                      <ChevronUp className="trend-arrow up" size={15} />
                    </div>
                  ))
                ) : loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="trend-item">
                      <span className="trend-rank">{i + 1}</span>
                      <div className="trend-info">
                        <div className="skeleton skeleton-line w-full" style={{ height: 11 }} />
                        <div className="skeleton skeleton-line w-1-3" style={{ height: 9, marginTop: 4 }} />
                      </div>
                    </div>
                  ))
                ) : null}
              </div>
            </div>

            {/* Activity */}
            <div className="anim-slide-in d-3">
              <p className="panel-title">Recent Activity</p>
              <div className="activity-list">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot-wrap">
                      <div className={`activity-dot ${a.color}`} />
                      {i < ACTIVITY.length - 1 && <div className="activity-line" />}
                    </div>
                    <div>
                      <div className="activity-text">{a.text}</div>
                      <div className="activity-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
