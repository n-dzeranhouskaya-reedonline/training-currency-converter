---
agent: agent
---

# Project Overview
Lyrics Printer is a modern web application for searching and displaying song lyrics. It features autocomplete, multi-source lyrics fetching with fallback, search history, and dark mode support.

# Technical Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.4
- **Testing:** Jest 29.7, React Testing Library
- **Deployment:** Node.js 18+

# Core Features
- Multi-source lyrics fetching (Lyrics.ovh, API Seeds) with fallback and timeouts
- Autocomplete for artist and song title
- Search history (localStorage, last 10 searches)
- Responsive design and dark mode
- Real-time validation and error handling

# Architecture
- **app/page.tsx:** Main client component, manages state, validation, API calls
- **components/:** Reusable UI components (AutocompleteInput, Button, Input, LyricsDisplay, SearchHistory, ErrorMessage)
- **app/api/:** API routes for lyrics and autocomplete
- **utils/:** Validation, API helpers, localStorage management
- **types/index.ts:** All TypeScript interfaces

# Key Development Patterns
- All form state and validation in `app/page.tsx` using `useState`
- Validation utilities return `ValidationError | null` (never throw)
- API routes use multi-source fallback with retry and timeout logic
- All types in a single file (`types/index.ts`)
- Tailwind CSS only, no separate CSS files
- Each component and utility has a corresponding test file

# Testing Strategy
- Jest with React Testing Library
- Test files live next to source files (e.g., `Button.tsx` and `Button.test.tsx`)
- API routes tested with mocked fetch
- Coverage collected from `app/`, `components/`, `utils/`

# Project Structure
```
app/
	api/
		lyrics/route.ts           # Main lyrics API endpoint
		autocomplete/artists/     # Artist autocomplete API
		autocomplete/songs/       # Song autocomplete API
	layout.tsx                  # Root layout
	page.tsx                    # Main page
	globals.css                 # Global styles
components/
	AutocompleteInput.tsx       # Autocomplete input
	Button.tsx                  # Button
	Input.tsx                   # Input
	LyricsDisplay.tsx           # Lyrics display
	SearchHistory.tsx           # Search history
	ErrorMessage.tsx            # Error display
types/
	index.ts                    # TypeScript types
utils/
	api.ts                      # API helpers
	storage.ts                  # localStorage helpers
	validation.ts               # Validation logic
```