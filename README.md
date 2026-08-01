# Pulse AI — India Edition

A premium, real-time **India-centric** tech and business news feed powered by **The Guardian Open Platform**. Track the pulse of Indian companies, startups, cities, government initiatives, and emerging technologies — all in a sleek, dark-mode interface.

## Live Demo

🚀 **[https://pulse-ai-khaki.vercel.app](https://pulse-ai-khaki.vercel.app)**

---

## Scope — India First

Pulse AI is built specifically around the Indian tech and business ecosystem:

| Category | Coverage |
|---|---|
| **Companies** | Tata Group, Reliance / Jio, Infosys, Zomato, Flipkart, HDFC |
| **Cities & Hubs** | Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune |
| **Topics** | Indian Startups, Indian Economy, ISRO & Space, Fintech & UPI, Digital India, AI in India |

All news queries are contextually scoped to India — searching "AI" returns AI stories specifically about India, not global AI news.

---

## Features

- **Real News, India-Scoped** — Live articles from The Guardian, filtered for Indian context, refreshed every 5 minutes via edge caching
- **Accurate Sidebar Counts** — Each topic shows its real Guardian article total, fetched in parallel on load
- **Sort Controls** — Latest / Trending (by reach) / Top (by engagement)
- **Bookmark Articles** — Save stories within session
- **India Signal Panel** — Daily insight card summarising India's top ecosystem trends
- **Trending Now** — Derived live from the current feed by estimated reach
- **Live Stats Bar** — Stories loaded, estimated reach, avg engagement, active topics
- **Skeleton Loaders** — Shimmer placeholders while articles fetch
- **Error Handling** — Clean error state with a retry button
- **Premium Dark UI** — Ambient glow orbs, engagement bars, micro-animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS with CSS Variables |
| Icons | [Lucide React](https://lucide.dev) |
| News Source | [The Guardian Open Platform](https://open-platform.theguardian.com) |
| Hosting | [Vercel](https://vercel.com) |

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Uses The Guardian's free `test` key by default — no setup required.  
> For higher rate limits, register at [open-platform.theguardian.com](https://open-platform.theguardian.com) and set:
> ```
> GUARDIAN_API_KEY=your_key_here
> ```
> in a `.env.local` file.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── news/
│   │       └── route.ts     # Guardian API proxy — India-scoped queries, 5 min cache
│   ├── globals.css          # Full design system
│   ├── layout.tsx           # Root layout + metadata
│   └── page.tsx             # Main feed UI
```

---

## Recommended Future Scope

These are high-impact extensions that would significantly deepen Pulse AI's India coverage:

### 🌐 Content & Data Sources
- **Native Indian News APIs** — Integrate The Hindu, Economic Times, or Mint APIs for primary-source Indian journalism
- **PIB (Press Information Bureau) Feed** — Direct government press releases and policy announcements
- **BSE / NSE Integration** — Live stock data for listed Indian companies (Tata, Reliance, Infosys, etc.) shown alongside news
- **Startup Funding Tracker** — Crunchbase / Tracxn API integration for real-time India funding rounds and valuations

### 🗺️ Deeper Geographical Coverage
- **State-level filtering** — Go beyond cities to Maharashtra, Karnataka, Tamil Nadu, Telangana, Gujarat, etc.
- **Tier 2 & Tier 3 city coverage** — Jaipur, Ahmedabad, Lucknow, Kochi, Chandigarh startup scenes
- **Regional language support** — Headlines in Hindi, Tamil, Telugu, Bengali, Marathi via translation APIs

### 📊 Intelligence & Analytics
- **Sentiment Analysis** — Real-time positive/negative/neutral scoring per topic using an LLM API
- **Trend Forecasting** — "Rising topics" detected before they peak using Guardian historical volume
- **Sector Pulse Scores** — Weekly composite health score per sector (Fintech, SaaS, D2C, etc.)
- **Funding Heatmap** — Visual map of where venture capital is flowing across Indian cities

### 🔔 User Features
- **Personalised digest** — Email or push summary of top India stories, configurable by topic
- **Watchlists** — Follow specific companies or founders and get alerts on new mentions
- **Saved Article Library** — Persistent bookmarks with tags and notes (currently session-only)
- **Social sharing** — Share article summaries with auto-generated India context

### 🏛️ Governance & Policy Track
- **Budget & Finance Bill tracker** — Dedicated section around Union Budget, RBI policy, SEBI circulars
- **Startup India policy monitor** — Track DPIIT announcements, PLI schemes, and regulatory changes
- **ISRO Mission Tracker** — Live mission status board for Chandrayaan, Gaganyaan, Aditya-L1

### ⚙️ Platform
- **Mobile app** — React Native companion with push notifications
- **Self-hosted deployment guide** — Helm chart + Docker Compose for teams wanting on-prem setup
- **Multi-tenant whitelabel** — Allow VC funds, accelerators, or media houses to deploy their own Pulse instance
