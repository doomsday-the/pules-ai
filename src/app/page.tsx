"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2, Globe, Tag, Search, Bell, Bookmark, BookmarkCheck,
  Zap, TrendingUp, LayoutGrid, List, SlidersHorizontal,
  MessageSquare, Clock, ChevronUp, ChevronRight, Flame, Eye,
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
  id: string;
  title: string;
  description: string;
  topic: string;
  topicType: string;
  date: string;
  readTime: string;
  author: string;
  authorInitials: string;
  url: string;
  comments: number;
  views: number;
  engagement: number;
}

interface Topic {
  id: string;
  name: string;
  type: string;
  count: number | null; // null = loading
}

/* ── Static topic list ─────────────────────────── */
const TOPICS_BASE: Omit<Topic, "count">[] = [
  { id: "1",  name: "Apple",                   type: "company" },
  { id: "2",  name: "Microsoft",               type: "company" },
  { id: "3",  name: "Nvidia",                  type: "company" },
  { id: "4",  name: "North America",           type: "region"  },
  { id: "5",  name: "Europe",                  type: "region"  },
  { id: "6",  name: "Asia Pacific",            type: "region"  },
  { id: "7",  name: "Artificial Intelligence", type: "topic"   },
  { id: "8",  name: "Quantum Computing",       type: "topic"   },
  { id: "9",  name: "Space Exploration",       type: "topic"   },
];

const ACTIVITY = [
  { color: "blue",   text: <><strong>AI Reasoning paper</strong> is trending in your feed</>,  time: "2m ago"  },
  { color: "purple", text: <><strong>3 new stories</strong> added to Nvidia</>,                time: "18m ago" },
  { color: "green",  text: <><strong>Space Exploration</strong> has a new top article</>,       time: "1h ago"  },
  { color: "blue",   text: <>Your saved story on <strong>EU regulation</strong> was updated</>, time: "3h ago"  },
];

/* ── Helpers ───────────────────────────────────── */
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h >>> 0);
}

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600)    return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)  return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

function getInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "SR";
}

function transform(raw: GuardianArticle, topic: string, topicType: string): Article {
  const h = hashStr(raw.id);
  const byline = raw.fields?.byline?.replace(/<[^>]+>/g, "") ?? "Staff Reporter";
  return {
    id:            raw.id,
    title:         raw.webTitle,
    description:   raw.fields?.trailText?.replace(/<[^>]+>/g, "") ?? "",
    topic,
    topicType,
    date:          relativeTime(raw.webPublicationDate),
    readTime:      `${3 + (h % 7)} min`,
    author:        byline,
    authorInitials: getInitials(byline),
    url:           raw.webUrl,
    comments:      50  + (h % 400),
    views:         800 + (h % 18000),
    engagement:    40  + (h % 55),
  };
}

/* ── Fetch helpers ─────────────────────────────── */
async function fetchArticles(topic: string): Promise<Article[]> {
  const topicData = TOPICS_BASE.find(t => t.name === topic);
  const topicType = topicData?.type ?? "topic";

  const res = await fetch(`/api/news?topic=${encodeURIComponent(topic)}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const results: GuardianArticle[] = data.response?.results ?? [];
  return results.map(r => transform(r, topic, topicType));
}

async function fetchCount(topic: string): Promise<number> {
  const res = await fetch(`/api/news?topic=${encodeURIComponent(topic)}&countOnly=true`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.response?.total ?? 0;
}

/* ── SkeletonCards ─────────────────────────────── */
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

/* ── Main Component ────────────────────────────── */
export default function Home() {
  const [activeTopic, setActiveTopic]  = useState<string>("All Stories");
  const [articles,    setArticles]     = useState<Article[]>([]);
  const [topics,      setTopics]       = useState<Topic[]>(
    TOPICS_BASE.map(t => ({ ...t, count: null }))
  );
  const [allCount,    setAllCount]     = useState<number | null>(null);
  const [loading,     setLoading]      = useState(true);
  const [error,       setError]        = useState<string | null>(null);
  const [sortBy,      setSortBy]       = useState<"latest" | "trending" | "top">("latest");
  const [bookmarked,  setBookmarked]   = useState<Set<string>>(new Set());

  /* Fetch articles for active topic */
  const loadArticles = useCallback(async (topic: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArticles(topic);
      setArticles(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load news");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Initial load: articles + all counts in parallel */
  useEffect(() => {
    loadArticles("All Stories");

    // Fetch counts for all topics + "All Stories" in parallel
    fetchCount("All Stories").then(n => setAllCount(n));
    Promise.all(
      TOPICS_BASE.map(t => fetchCount(t.name).then(n => ({ id: t.id, count: n })))
    ).then(results => {
      setTopics(prev =>
        prev.map(t => {
          const found = results.find(r => r.id === t.id);
          return found ? { ...t, count: found.count } : t;
        })
      );
    });
  }, [loadArticles]);

  /* Reload when topic changes */
  useEffect(() => {
    loadArticles(activeTopic);
  }, [activeTopic, loadArticles]);

  /* Sort */
  const sorted = [...articles].sort((a, b) => {
    if (sortBy === "trending") return b.views - a.views;
    if (sortBy === "top")      return b.engagement - a.engagement;
    return 0;
  });

  /* Derived counts */
  const totalViews     = articles.reduce((s, a) => s + a.views, 0);
  const avgEngagement  = articles.length
    ? Math.round(articles.reduce((s, a) => s + a.engagement, 0) / articles.length)
    : 0;

  /* Trending list derived from current articles */
  const trending = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map(a => ({ name: a.title.slice(0, 40) + (a.title.length > 40 ? "…" : ""), count: `${(a.views / 1000).toFixed(1)}k views`, up: true }));

  const companies = topics.filter(t => t.type === "company");
  const regions   = topics.filter(t => t.type === "region");
  const topicList = topics.filter(t => t.type === "topic");

  function toggleBookmark(id: string) {
    setBookmarked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function CountBadge({ n }: { n: number | null }) {
    if (n === null) return <span className="nav-count">…</span>;
    return <span className="nav-count">{n.toLocaleString()}</span>;
  }

  return (
    <div className="app-wrap">
      {/* Ambient glow */}
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
          <span className="brand-badge">Beta</span>
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
          <button
            key={t.id}
            className={`nav-btn ${activeTopic === t.name ? "active" : ""}`}
            onClick={() => setActiveTopic(t.name)}
          >
            <Building2 className="nav-icon" size={15} />
            <span className="nav-label">{t.name}</span>
            <CountBadge n={t.count} />
          </button>
        ))}

        <p className="nav-section-label">Regions</p>
        {regions.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${activeTopic === t.name ? "active" : ""}`}
            onClick={() => setActiveTopic(t.name)}
          >
            <Globe className="nav-icon" size={15} />
            <span className="nav-label">{t.name}</span>
            <CountBadge n={t.count} />
          </button>
        ))}

        <p className="nav-section-label">Topics</p>
        {topicList.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${activeTopic === t.name ? "active" : ""}`}
            onClick={() => setActiveTopic(t.name)}
          >
            <Tag className="nav-icon" size={15} />
            <span className="nav-label">{t.name}</span>
            <CountBadge n={t.count} />
          </button>
        ))}
      </aside>

      {/* ── Main ── */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="search-wrap">
            <Search className="search-icon-inner" size={16} />
            <input className="search-input" type="text" placeholder="Search stories, topics, companies…" />
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

        {/* Content */}
        <div className="content-layout">
          <div className="feed-area">
            {/* Feed Header */}
            <div className="feed-header anim-fade-up d-1">
              <div className="feed-title-group">
                <h1 className="feed-title">{activeTopic}</h1>
                <p className="feed-subtitle">
                  {loading
                    ? "Fetching latest stories…"
                    : `${sorted.length} ${sorted.length === 1 ? "story" : "stories"} ${activeTopic === "All Stories" ? "across the tech ecosystem" : `about ${activeTopic}`}`
                  }
                </p>
              </div>
              <div className="feed-controls">
                <button className={`filter-btn ${sortBy === "latest"   ? "active" : ""}`} onClick={() => setSortBy("latest")}>
                  <Clock size={13} /> Latest
                </button>
                <button className={`filter-btn ${sortBy === "trending" ? "active" : ""}`} onClick={() => setSortBy("trending")}>
                  <TrendingUp size={13} /> Trending
                </button>
                <button className={`filter-btn ${sortBy === "top"      ? "active" : ""}`} onClick={() => setSortBy("top")}>
                  <Flame size={13} /> Top
                </button>
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
                  <RefreshCw size={13} style={{ display: "inline", marginRight: "0.4rem" }} />
                  Retry
                </button>
              </div>
            ) : sorted.length > 0 ? (
              <div className="feed-grid">
                {sorted.map((article, i) => {
                  const isBookmarked = bookmarked.has(article.id);
                  return (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link"
                    >
                      <article
                        className={`card anim-fade-up`}
                        style={{ animationDelay: `${0.06 + i * 0.06}s` }}
                      >
                        <div className="card-top">
                          <span className={`badge ${article.topicType}`}>
                            {article.topicType === "company" && <Building2 size={10} />}
                            {article.topicType === "region"  && <Globe size={10} />}
                            {article.topicType === "topic"   && <Tag size={10} />}
                            {article.topic}
                          </span>
                          <div className="card-actions">
                            <button
                              className={`card-icon-btn ${isBookmarked ? "bookmarked" : ""}`}
                              onClick={e => { e.preventDefault(); toggleBookmark(article.id); }}
                              title={isBookmarked ? "Remove bookmark" : "Bookmark"}
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
                <p className="empty-sub">There are no recent updates for this topic yet. Check back soon.</p>
              </div>
            )}
          </div>

          {/* ── Right Panel ── */}
          <aside className="right-panel">
            {/* AI Insight */}
            <div className="anim-slide-in d-1">
              <p className="panel-title">AI Insight</p>
              <div className="insight-card">
                <div className="insight-header">
                  <div className="insight-icon"><Zap size={14} color="white" /></div>
                  <span className="insight-label">Today's Signal</span>
                  <span className="insight-sublabel">Live</span>
                </div>
                <p className="insight-text">
                  AI infrastructure investment is accelerating globally. Nvidia's dominance and AGI research breakthroughs are converging — this is the most active week for AI news in 6 months.
                </p>
                <div className="insight-tags">
                  <span className="insight-tag">#AGI</span>
                  <span className="insight-tag">#Nvidia</span>
                  <span className="insight-tag">#Infrastructure</span>
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
                ) : (
                  <div style={{ color: "var(--muted)", fontSize: "0.82rem", padding: "0.5rem" }}>
                    No trending data yet.
                  </div>
                )}
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
