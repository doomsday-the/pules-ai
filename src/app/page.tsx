"use client";

import { useState } from "react";
import {
  Building2, Globe, Tag, Search, Bell, Bookmark, BookmarkCheck,
  Zap, TrendingUp, LayoutGrid, List, SlidersHorizontal,
  MessageSquare, Clock, ChevronUp, ChevronRight, Flame, Eye
} from "lucide-react";

/* ── Data ────────────────────────────────────────── */
interface Topic {
  id: string; name: string; type: string; count: number;
}
interface Article {
  id: number; title: string; description: string; topic: string;
  date: string; readTime: string; author: string; authorInitials: string;
  comments: number; views: number; engagement: number; // 0–100
}

const ALL_TOPICS: Topic[] = [
  { id: "1", name: "Apple",                 type: "company", count: 12 },
  { id: "2", name: "Microsoft",             type: "company", count: 8  },
  { id: "3", name: "Nvidia",                type: "company", count: 15 },
  { id: "4", name: "North America",         type: "region",  count: 24 },
  { id: "5", name: "Europe",                type: "region",  count: 11 },
  { id: "6", name: "Asia Pacific",          type: "region",  count: 9  },
  { id: "7", name: "Artificial Intelligence", type: "topic", count: 31 },
  { id: "8", name: "Quantum Computing",     type: "topic",   count: 7  },
  { id: "9", name: "Space Exploration",     type: "topic",   count: 19 },
];

const ARTICLES: Article[] = [
  {
    id: 1,
    title: "The Future of Artificial General Intelligence",
    description: "Researchers are making unprecedented leaps toward AGI, with major breakthroughs in reasoning capabilities and multi-modal architectures. What does this mean for the next decade of technology and society?",
    topic: "Artificial Intelligence", date: "2 hours ago", readTime: "6 min",
    author: "Elena Rodriguez", authorInitials: "ER", comments: 128, views: 4800, engagement: 87,
  },
  {
    id: 2,
    title: "Apple's M-Series Chip Rewrites the Performance Rulebook",
    description: "The latest silicon promises a 40% performance boost with dramatically reduced power consumption, setting a new benchmark for laptop computing. Rivals are already scrambling to respond.",
    topic: "Apple", date: "5 hours ago", readTime: "4 min",
    author: "James Chen", authorInitials: "JC", comments: 342, views: 12300, engagement: 95,
  },
  {
    id: 3,
    title: "Quantum Supremacy: The Next Milestone Is Closer Than You Think",
    description: "A coalition of tech giants published a joint paper outlining a credible roadmap to scalable quantum computers. The timeline might be measured in years, not decades.",
    topic: "Quantum Computing", date: "1 day ago", readTime: "8 min",
    author: "Dr. Sarah Jenkins", authorInitials: "SJ", comments: 89, views: 6100, engagement: 72,
  },
  {
    id: 4,
    title: "The EU's Digital Markets Act Is Reshaping Global Tech",
    description: "New regulations are forcing the world's largest technology companies to fundamentally change how they operate within European borders — and the ripple effects are being felt globally.",
    topic: "Europe", date: "1 day ago", readTime: "5 min",
    author: "Marcus Thorne", authorInitials: "MT", comments: 215, views: 8700, engagement: 80,
  },
  {
    id: 5,
    title: "Microsoft Bets the Enterprise on Deeply Embedded AI",
    description: "The Redmond giant is weaving artificial intelligence into every layer of its enterprise software stack. Early adopters report productivity gains of up to 35%, but security concerns linger.",
    topic: "Microsoft", date: "2 days ago", readTime: "7 min",
    author: "Linda Foster", authorInitials: "LF", comments: 156, views: 5400, engagement: 68,
  },
  {
    id: 6,
    title: "Reusable Rockets Are Making Space Cheap",
    description: "Aerospace companies are slashing the cost of reaching orbit by up to 90% through innovative rocket recovery systems. A new era of commercial space infrastructure is beginning.",
    topic: "Space Exploration", date: "3 days ago", readTime: "5 min",
    author: "Robert Vance", authorInitials: "RV", comments: 412, views: 18200, engagement: 92,
  },
  {
    id: 7,
    title: "Nvidia's Blackwell Architecture Dominates AI Compute",
    description: "Nvidia's next-generation GPU architecture is delivering performance gains that competitors cannot match — cementing its dominance in the AI training and inference market for years to come.",
    topic: "Nvidia", date: "4 hours ago", readTime: "6 min",
    author: "Priya Kapoor", authorInitials: "PK", comments: 204, views: 9300, engagement: 91,
  },
  {
    id: 8,
    title: "Asia Pacific Leads the Next Wave of Fintech Innovation",
    description: "From Singapore to Seoul, a new generation of financial technology startups is building infrastructure that's leapfrogging the traditional banking systems of the West.",
    topic: "Asia Pacific", date: "2 days ago", readTime: "9 min",
    author: "Yuki Tanaka", authorInitials: "YT", comments: 77, views: 3200, engagement: 58,
  },
];

const TRENDING = [
  { name: "Artificial Intelligence", count: "31 stories", up: true },
  { name: "Nvidia Blackwell",        count: "19 stories", up: true },
  { name: "Space Exploration",       count: "19 stories", up: true },
  { name: "EU Regulation",           count: "11 stories", up: false },
  { name: "Quantum Computing",       count: "7 stories",  up: true },
];

const ACTIVITY = [
  { color: "blue",   text: <><strong>AI Reasoning paper</strong> is trending in your feed</>,         time: "2m ago" },
  { color: "purple", text: <><strong>3 new stories</strong> added to Nvidia</>,                       time: "18m ago" },
  { color: "green",  text: <><strong>Space Exploration</strong> has a new top article</>,              time: "1h ago" },
  { color: "blue",   text: <>Your saved story on <strong>EU regulation</strong> was updated</>,       time: "3h ago" },
];

/* ── Component ───────────────────────────────────── */
export default function Home() {
  const [activeTopic, setActiveTopic] = useState<string>("All Stories");
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "top">("latest");
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());

  const companies = ALL_TOPICS.filter(t => t.type === "company");
  const regions   = ALL_TOPICS.filter(t => t.type === "region");
  const topics    = ALL_TOPICS.filter(t => t.type === "topic");

  const base = activeTopic === "All Stories"
    ? ARTICLES
    : ARTICLES.filter(a => a.topic === activeTopic);

  const sorted = [...base].sort((a, b) => {
    if (sortBy === "trending")  return b.views - a.views;
    if (sortBy === "top")       return b.engagement - a.engagement;
    return 0; // latest = file order
  });

  const totalStories = ARTICLES.length;
  const totalViews   = ARTICLES.reduce((s, a) => s + a.views, 0);
  const avgEngagement = Math.round(ARTICLES.reduce((s, a) => s + a.engagement, 0) / ARTICLES.length);

  function toggleBookmark(id: number) {
    setBookmarked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
          <div className="brand-logo">
            <Zap size={16} color="white" />
          </div>
          <span className="brand-name">Pulse AI</span>
          <span className="brand-badge">Beta</span>
        </div>

        <button
          className={`nav-btn ${activeTopic === "All Stories" ? "active" : ""}`}
          onClick={() => setActiveTopic("All Stories")}
        >
          <LayoutGrid className="nav-icon" size={16} />
          <span className="nav-label">All Stories</span>
          <span className="nav-count">{ARTICLES.length}</span>
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
            <span className="nav-count">{t.count}</span>
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
            <span className="nav-count">{t.count}</span>
          </button>
        ))}

        <p className="nav-section-label">Topics</p>
        {topics.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${activeTopic === t.name ? "active" : ""}`}
            onClick={() => setActiveTopic(t.name)}
          >
            <Tag className="nav-icon" size={15} />
            <span className="nav-label">{t.name}</span>
            <span className="nav-count">{t.count}</span>
          </button>
        ))}
      </aside>

      {/* ── Main ── */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="search-wrap">
            <Search className="search-icon-inner" size={16} />
            <input
              className="search-input"
              type="text"
              placeholder="Search stories, topics, companies…"
            />
            <div className="search-shortcut">
              <kbd className="kbd">⌘</kbd>
              <kbd className="kbd">K</kbd>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={17} />
              <span className="notif-dot" />
            </button>
            <button className="icon-btn">
              <Bookmark size={17} />
            </button>
            <div className="avatar">AM</div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="stats-bar anim-fade-up">
          <div className="stat-item">
            <div className="stat-icon blue"><List size={16} /></div>
            <div>
              <div className="stat-value">{totalStories}</div>
              <div className="stat-label">Stories Today</div>
            </div>
            <span className="stat-delta">+12%</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon purple"><Eye size={16} /></div>
            <div>
              <div className="stat-value">{(totalViews / 1000).toFixed(1)}k</div>
              <div className="stat-label">Total Views</div>
            </div>
            <span className="stat-delta">+8%</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon green"><TrendingUp size={16} /></div>
            <div>
              <div className="stat-value">{avgEngagement}%</div>
              <div className="stat-label">Avg Engagement</div>
            </div>
            <span className="stat-delta">+3%</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon amber"><Flame size={16} /></div>
            <div>
              <div className="stat-value">{ALL_TOPICS.length}</div>
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
                  {sorted.length} {sorted.length === 1 ? "story" : "stories"}&nbsp;
                  {activeTopic === "All Stories" ? "across your ecosystem" : `about ${activeTopic}`}
                </p>
              </div>
              <div className="feed-controls">
                <button
                  className={`filter-btn ${sortBy === "latest" ? "active" : ""}`}
                  onClick={() => setSortBy("latest")}
                >
                  <Clock size={13} /> Latest
                </button>
                <button
                  className={`filter-btn ${sortBy === "trending" ? "active" : ""}`}
                  onClick={() => setSortBy("trending")}
                >
                  <TrendingUp size={13} /> Trending
                </button>
                <button
                  className={`filter-btn ${sortBy === "top" ? "active" : ""}`}
                  onClick={() => setSortBy("top")}
                >
                  <Flame size={13} /> Top
                </button>
                <button className="filter-btn">
                  <SlidersHorizontal size={13} />
                </button>
              </div>
            </div>

            {/* Cards */}
            {sorted.length > 0 ? (
              <div className="feed-grid">
                {sorted.map((article, i) => {
                  const topicType = ALL_TOPICS.find(t => t.name === article.topic)?.type ?? "topic";
                  const isBookmarked = bookmarked.has(article.id);
                  return (
                    <article
                      key={article.id}
                      className={`card anim-fade-up`}
                      style={{ animationDelay: `${0.08 + i * 0.07}s` }}
                    >
                      <div className="card-top">
                        <span className={`badge ${topicType}`}>
                          {topicType === "company" && <Building2 size={10} />}
                          {topicType === "region"  && <Globe size={10} />}
                          {topicType === "topic"   && <Tag size={10} />}
                          {article.topic}
                        </span>
                        <div className="card-actions">
                          <button
                            className={`card-icon-btn ${isBookmarked ? "bookmarked" : ""}`}
                            onClick={() => toggleBookmark(article.id)}
                            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                          >
                            {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                          </button>
                        </div>
                      </div>

                      <h2 className="card-title">{article.title}</h2>
                      <p className="card-desc">{article.description}</p>

                      <div>
                        <div className="engagement-bar">
                          <div
                            className="engagement-fill"
                            style={{ width: `${article.engagement}%` }}
                          />
                        </div>
                      </div>

                      <div className="card-meta">
                        <div className="meta-author">
                          <div className="author-dot">{article.authorInitials}</div>
                          <span>{article.author}</span>
                        </div>
                        <div className="meta-stat">
                          <MessageSquare size={12} />
                          {article.comments}
                        </div>
                        <span className="meta-dot">·</span>
                        <div className="meta-stat">
                          <Clock size={12} />
                          {article.readTime}
                        </div>
                        <span className="meta-dot">·</span>
                        <div className="meta-stat">{article.date}</div>
                      </div>
                    </article>
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
                  AI infrastructure investment is accelerating globally. Nvidia's Blackwell dominance and
                  AGI research breakthroughs are converging — this is the most active week for AI news in 6 months.
                </p>
                <div className="insight-tags">
                  <span className="insight-tag">#AGI</span>
                  <span className="insight-tag">#Nvidia</span>
                  <span className="insight-tag">#Infrastructure</span>
                  <span className="insight-tag">#Chips</span>
                </div>
              </div>
            </div>

            {/* Trending */}
            <div className="anim-slide-in d-2">
              <p className="panel-title">Trending Now</p>
              <div className="trend-list">
                {TRENDING.map((t, i) => (
                  <div key={i} className="trend-item">
                    <span className="trend-rank">{i + 1}</span>
                    <div className="trend-info">
                      <div className="trend-name">{t.name}</div>
                      <div className="trend-count">{t.count}</div>
                    </div>
                    {t.up
                      ? <ChevronUp className="trend-arrow up" size={15} />
                      : <ChevronRight className="trend-arrow" size={15} />
                    }
                  </div>
                ))}
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
