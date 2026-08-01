# Pulse AI

A premium, real-time tech news feed powered by **The Guardian API**. Browse the latest stories across companies, regions, and topics — all in a sleek, dark-mode interface.

## Live Demo

🚀 **[https://pulse-ai-khaki.vercel.app](https://pulse-ai-khaki.vercel.app)**

---

## Features

- **Real News** — Live articles pulled from The Guardian, refreshed every 5 minutes via server-side caching
- **Smart Filtering** — Browse by Companies (Apple, Microsoft, Nvidia), Regions (North America, Europe, Asia Pacific), or Topics (AI, Quantum Computing, Space)
- **Accurate Counts** — Sidebar topic counters reflect actual Guardian article totals fetched in parallel on load
- **Sort Controls** — Switch between Latest, Trending (by reach), and Top (by engagement)
- **Bookmark Articles** — Save stories for later within the session
- **AI Insight Panel** — Daily signal card summarizing the biggest themes
- **Trending Now** — Derived live from the current feed sorted by estimated reach
- **Stats Bar** — Real-time metrics: stories loaded, estimated reach, avg engagement, active topics
- **Skeleton Loaders** — Shimmer placeholders while articles fetch
- **Error Handling** — Clean error state with a retry button if the API is unreachable
- **Premium Aesthetics** — Dark theme, ambient glow orbs, engagement progress bars, micro-animations

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | [Next.js 16](https://nextjs.org) (App Router) |
| Language    | TypeScript                          |
| Styling     | Vanilla CSS with CSS Variables      |
| Icons       | [Lucide React](https://lucide.dev)  |
| News Source | [The Guardian Open Platform](https://open-platform.theguardian.com) |
| Hosting     | [Vercel](https://vercel.com)        |

---

## Local Development

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> The app uses The Guardian's free `test` API key by default — no setup required.  
> For higher rate limits, get a free key at [open-platform.theguardian.com](https://open-platform.theguardian.com) and add it to `.env.local`:
> ```
> GUARDIAN_API_KEY=your_key_here
> ```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── news/
│   │       └── route.ts     # Guardian API proxy (server-side, cached)
│   ├── globals.css          # Full design system
│   ├── layout.tsx           # Root layout + metadata
│   └── page.tsx             # Main feed UI
```
