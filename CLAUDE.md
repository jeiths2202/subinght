# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based YouTube channel analysis and decision support system that helps users organize subscribed channels, analyze trends, and make informed decisions. The application features automatic channel categorization, mindmap visualization, and a query system.

## Development Commands

```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production (outputs to ./out directory with sourcemaps)
npm run build

# Preview production build
npm run preview
```

## Architecture

### Auto-Imports Configuration
The project uses `unplugin-auto-import` to automatically import React hooks, React Router, and react-i18next functions. You **do not** need to manually import these in component files:
- React: `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`, `useRef`, `lazy`, `memo`, etc.
- React Router: `useNavigate`, `useLocation`, `useParams`, `Link`, `Navigate`, `Outlet`, etc.
- React i18next: `useTranslation`, `Trans`

### Vite Configuration
- **Base Path**: Configurable via `BASE_PATH` environment variable (default: `/`)
- **Preview Mode**: Set via `IS_PREVIEW` environment variable
- **Path Alias**: `@` maps to `./src`
- **Build Output**: `out` directory with sourcemaps enabled
- **Server**: Runs on `0.0.0.0:3000`

### Router Structure
Routes use lazy loading pattern in `src/router/config.tsx`:
- `/` - Home (dashboard)
- `/channels` - Channel management
- `/analysis` - Trend analysis
- `/query` - Query refinement system
- `/connect` - YouTube API connection
- `/mindmap` - Visual mindmap of channels
- `*` - 404 Not Found

All routes are wrapped with `<BrowserRouter basename={__BASE_PATH__}>` in `App.tsx`.

### Page Organization
Pages follow the pattern `src/pages/{pagename}/page.tsx`. Each page is a default export lazy-loaded in the router config.

### Component Structure
- `src/components/base/` - Reusable UI components (Button, Card, Input)
- `src/components/feature/` - Feature-specific components (Header)

### YouTube API Integration
The `src/utils/youtubeApi.ts` module handles:
- **YouTubeAPI class**: Fetches subscriptions and channel details via YouTube Data API v3
- **Auto-categorization**: Classifies channels using keyword matching in `CATEGORY_KEYWORDS` (supports Korean and English)
- **Local Storage**: Caching layer via `saveChannelsToStorage()` and `loadChannelsFromStorage()`
- **Sync Function**: `syncChannelData(apiKey)` fetches all subscriptions with pagination (50 items per page) and stores categorized results

### Internationalization
i18next is configured in `src/i18n/index.ts`:
- Default language: English (`en`)
- Auto-detection enabled via `i18next-browser-languagedetector`
- Translations stored in `src/i18n/local/index.ts`

### Type Definitions
Core types in `src/types/index.ts`:
- `Channel` - YouTube channel with category
- `Video` - Video metadata
- `Category` - Category with color and count
- `Query` - Multi-step query refinement workflow
- `AnalysisResult` - Analysis insights

### Mock Data
Development uses mock data:
- `src/mocks/channels.ts` - Sample channels and categories
- `src/mocks/videos.ts` - Sample videos

## Tech Stack
- **Framework**: React 19 + Vite 7 + TypeScript 5.8
- **Routing**: React Router v7
- **Styling**: Tailwind CSS + PostCSS
- **Data Fetching**: @tanstack/react-query, Axios
- **Backend Services**: Firebase 12.0, Supabase 2.57
- **Payments**: Stripe React
- **Charts**: Recharts 3.2
- **i18n**: i18next + react-i18next
- **Date Utils**: date-fns 4.1

## Key Patterns
- Auto-import eliminates need for manual React/Router imports
- Lazy route loading for code splitting
- Category-based channel organization with keyword matching
- LocalStorage caching layer for YouTube data
- Page-based routing with `/page.tsx` convention
