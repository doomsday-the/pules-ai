"use client";

import { useState } from "react";
import { 
  Building2, Globe, Tag, Search, Bell, 
  Menu, Hexagon, TrendingUp, Sparkles, Star, MessageSquare 
} from "lucide-react";

interface Topic {
  id: string;
  name: string;
  type: string;
}

const ALL_TOPICS: Topic[] = [
  { id: "1", name: "Apple", type: "company" },
  { id: "2", name: "Microsoft", type: "company" },
  { id: "3", name: "Nvidia", type: "company" },
  { id: "4", name: "North America", type: "region" },
  { id: "5", name: "Europe", type: "region" },
  { id: "6", name: "Asia Pacific", type: "region" },
  { id: "7", name: "Artificial Intelligence", type: "topic" },
  { id: "8", name: "Quantum Computing", type: "topic" },
  { id: "9", name: "Space Exploration", type: "topic" },
];

const ARTICLES = [
  {
    id: 1,
    title: "The Future of Artificial General Intelligence",
    description: "Researchers are making unprecedented leaps toward AGI, with major breakthroughs in reasoning capabilities and neural network architectures. What does this mean for the next decade of technology?",
    topic: "Artificial Intelligence",
    date: "2 hours ago",
    author: "Elena Rodriguez",
    comments: 128
  },
  {
    id: 2,
    title: "Apple Announces New Silicon Architecture",
    description: "The latest M-series chip promises a 40% performance boost with significantly reduced power consumption, setting a new benchmark for laptop processors in the industry.",
    topic: "Apple",
    date: "5 hours ago",
    author: "James Chen",
    comments: 342
  },
  {
    id: 3,
    title: "Quantum Supremacy: The Next Milestone",
    description: "A coalition of tech giants has published a joint paper outlining the roadmap to scalable quantum computers. The timeline might be much shorter than we previously anticipated.",
    topic: "Quantum Computing",
    date: "1 day ago",
    author: "Dr. Sarah Jenkins",
    comments: 89
  },
  {
    id: 4,
    title: "Tech Regulation in the European Union",
    description: "New policies are set to reshape how global technology companies operate within European borders. A deep dive into the regulatory framework and its global implications.",
    topic: "Europe",
    date: "1 day ago",
    author: "Marcus Thorne",
    comments: 215
  },
  {
    id: 5,
    title: "Microsoft's Integration of AI in Enterprise",
    description: "How the Redmond giant is weaving artificial intelligence into every layer of its enterprise software stack, from operating systems to productivity suites.",
    topic: "Microsoft",
    date: "2 days ago",
    author: "Linda Foster",
    comments: 156
  },
  {
    id: 6,
    title: "Advancements in Reusable Rocket Technology",
    description: "Space agencies and private aerospace companies are reducing the cost of escaping Earth's gravity by up to 90% through innovative recovery systems.",
    topic: "Space Exploration",
    date: "3 days ago",
    author: "Robert Vance",
    comments: 412
  },
];

export default function Home() {
  const [activeTopic, setActiveTopic] = useState<string>("All Stories");

  const companies = ALL_TOPICS.filter(t => t.type === "company");
  const regions = ALL_TOPICS.filter(t => t.type === "region");
  const topics = ALL_TOPICS.filter(t => t.type === "topic");

  const filteredArticles = activeTopic === "All Stories" 
    ? ARTICLES 
    : ARTICLES.filter(a => a.topic === activeTopic);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <Hexagon className="brand-icon" size={28} />
          <span>Pulse AI</span>
        </div>

        <button 
          className={`nav-button ${activeTopic === "All Stories" ? "active" : ""}`}
          onClick={() => setActiveTopic("All Stories")}
        >
          <Menu className="nav-icon" size={20} />
          <span>All Stories</span>
        </button>

        <h3 className="sidebar-title">Companies</h3>
        {companies.map(topic => (
          <button 
            key={topic.id} 
            className={`nav-button ${activeTopic === topic.name ? "active" : ""}`}
            onClick={() => setActiveTopic(topic.name)}
          >
            <Building2 className="nav-icon" size={18} />
            <span>{topic.name}</span>
          </button>
        ))}

        <h3 className="sidebar-title">Regions</h3>
        {regions.map(topic => (
          <button 
            key={topic.id} 
            className={`nav-button ${activeTopic === topic.name ? "active" : ""}`}
            onClick={() => setActiveTopic(topic.name)}
          >
            <Globe className="nav-icon" size={18} />
            <span>{topic.name}</span>
          </button>
        ))}

        <h3 className="sidebar-title">Topics</h3>
        {topics.map(topic => (
          <button 
            key={topic.id} 
            className={`nav-button ${activeTopic === topic.name ? "active" : ""}`}
            onClick={() => setActiveTopic(topic.name)}
          >
            <Tag className="nav-icon" size={18} />
            <span>{topic.name}</span>
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search ecosystem, topics, or companies..." 
            />
          </div>
          
          <div className="user-profile">
            <button className="icon-button">
              <Bell size={20} />
            </button>
            <div className="avatar">AM</div>
          </div>
        </div>

        <div className="animate-fade-in delay-1">
          <h1 className="section-title">{activeTopic}</h1>
          <p className="section-subtitle">
            {activeTopic === "All Stories" 
              ? "Your personalized feed of the latest updates across the tech ecosystem." 
              : `Latest updates and news related to ${activeTopic}.`}
          </p>
        </div>

        <div className="feed-grid">
          {filteredArticles.map((article, index) => {
            const topicData = ALL_TOPICS.find(t => t.name === article.topic);
            const topicTypeClass = topicData?.type || "topic";
            
            return (
              <div 
                key={article.id} 
                className={`card animate-fade-in`} 
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className="card-header">
                  <span className={`card-badge ${topicTypeClass}`}>
                    {article.topic}
                  </span>
                  <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                    <Star size={18} />
                  </button>
                </div>
                
                <h2 className="card-title">{article.title}</h2>
                <p className="card-description">{article.description}</p>
                
                <div className="card-footer">
                  <div className="footer-item">
                    <Sparkles size={16} />
                    <span>{article.author}</span>
                  </div>
                  <div className="footer-item">
                    <MessageSquare size={16} />
                    <span>{article.comments}</span>
                  </div>
                  <div className="footer-item" style={{ marginLeft: 'auto' }}>
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredArticles.length === 0 && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
            <TrendingUp size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No stories found</h3>
            <p>We couldn't find any recent updates for this topic.</p>
          </div>
        )}
      </main>
    </div>
  );
}
