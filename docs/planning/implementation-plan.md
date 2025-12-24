# BTMS - Detailed Implementation Plan

> Comprehensive breakdown for AI-assisted development
> Goal: Make each task small and specific enough for a fast, less-capable model to execute

---

## ⚠️ IMPORTANT NOTES

### Project Structure
This project uses a **flat WXT structure** (source at project root):
- `wxt.config.ts` - WXT configuration (at project root)
- `entrypoints/` - popup, options, sidepanel, background
- `src/` - components, hooks, services, types, assets

**Note**: The npm dev script uses `wxt .` instead of `wxt dev` to avoid WXT auto-detecting a folder named "dev" as the srcDir.

### Import Paths
From entrypoint files (e.g., `entrypoints/popup/main.tsx`), use:
```typescript
import '../src/assets/styles.css';
import { Popup } from '../src/components/Popup';
```

---

## 📋 Epic Structure Overview

> **🎉 ALL EPICs COMPLETE - December 23, 2024**

```
Phase 1: Foundation ✅ COMPLETE
├── EPIC-1: Project Setup ✅ COMPLETE
├── EPIC-2: Storage Layer ✅ COMPLETE (chrome.storage.local)
└── EPIC-3: Core Session Logic ✅ COMPLETE

Phase 2: AI Integration ✅ COMPLETE
├── EPIC-4: Chrome AI Service ✅ COMPLETE (Gemini Nano)
└── EPIC-5: AI Features ✅ COMPLETE (naming with fallback)

Phase 3: UI/UX ✅ COMPLETE
├── EPIC-6: Popup UI ✅ COMPLETE
├── EPIC-7: Session List Component ✅ COMPLETE
└── EPIC-8: Settings Page ✅ COMPLETE

Phase 4: Polish ✅ COMPLETE
├── EPIC-9: Auto-save & Background ✅ COMPLETE (chrome.alarms)
├── EPIC-10: Import/Export ✅ COMPLETE (JSON backup)
└── EPIC-11: Testing & Quality ✅ COMPLETE (Vitest setup)
```

---

# PHASE 1: FOUNDATION

## EPIC-1: Project Setup ✅ COMPLETE

### 1.1 Initialize Extension Project
**Description**: Set up a new Chrome extension project using WXT framework with TypeScript.

**Acceptance Criteria**:
- [ ] WXT project initialized with `npx wxt@latest init`
- [ ] TypeScript configured with strict mode
- [ ] Project runs with `npm run dev`
- [ ] Extension loads in Chrome at `chrome://extensions`

**Files to create**:
- `package.json`
- `tsconfig.json`
- `wxt.config.ts`

**Commands**:
```bash
npx wxt@latest init . --template vanilla
npm install
```

---

### 1.2 Configure Manifest V3
**Description**: Set up the Chrome extension manifest with required permissions.

**Acceptance Criteria**:
- [ ] Manifest includes name, version, description
- [ ] Permissions: `tabs`, `storage`, `tabGroups`
- [ ] Action (popup) configured
- [ ] Side panel configured
- [ ] Icons configured (use placeholder)

**Files to modify**:
- `wxt.config.ts` (WXT generates manifest)

**Manifest permissions needed**:
```json
{
  "permissions": ["tabs", "storage", "tabGroups"],
  "optional_permissions": ["history"]
}
```

---

### 1.3 Install Core Dependencies
**Description**: Install all required npm packages for the project.

**Acceptance Criteria**:
- [ ] React 18+ installed
- [ ] TypeScript types installed
- [ ] Tailwind CSS installed and configured
- [ ] TanStack Query installed
- [ ] TanStack Table installed
- [ ] TanStack Virtual installed
- [ ] Zustand installed

**Commands**:
```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npm install @tanstack/react-query @tanstack/react-table @tanstack/react-virtual
npm install zustand
npx tailwindcss init -p
```

---

### 1.4 Configure Tailwind CSS
**Description**: Set up Tailwind CSS with custom theme for the extension.

**Acceptance Criteria**:
- [ ] `tailwind.config.js` created
- [ ] Global CSS file imports Tailwind directives
- [ ] Dark mode configured (class strategy)
- [ ] Content paths configured for all entry points

**Files to create/modify**:
- `tailwind.config.js`
- `src/assets/styles.css`

**tailwind.config.js**:
```javascript
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {}
  },
  plugins: []
}
```

---

### 1.5 Create Extension Entry Points
**Description**: Set up the basic entry points for popup, background, and options.

**Acceptance Criteria**:
- [ ] Popup entry point created (`src/entrypoints/popup/`)
- [ ] Background service worker created (`src/entrypoints/background.ts`)
- [ ] Options page entry point created (`src/entrypoints/options/`)
- [ ] Side panel entry point created (`src/entrypoints/sidepanel/`)
- [ ] All entry points render "Hello World" placeholder

**Files to create**:
- `src/entrypoints/popup/index.html`
- `src/entrypoints/popup/main.tsx`
- `src/entrypoints/popup/App.tsx`
- `src/entrypoints/background.ts`
- `src/entrypoints/options/index.html`
- `src/entrypoints/options/main.tsx`
- `src/entrypoints/sidepanel/index.html`
- `src/entrypoints/sidepanel/main.tsx`

---

### 1.6 Create Project Folder Structure
**Description**: Set up the standard folder structure for shared code.

**Acceptance Criteria**:
- [ ] `src/lib/` directory for shared utilities
- [ ] `src/components/` for shared React components
- [ ] `src/hooks/` for custom React hooks
- [ ] `src/types/` for TypeScript type definitions
- [ ] `src/stores/` for Zustand stores
- [ ] `src/services/` for service classes

**Folders to create**:
```
src/
├── components/       # Shared React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── services/        # Service classes (AI, storage, etc.)
├── stores/          # Zustand stores
├── types/           # TypeScript type definitions
└── entrypoints/     # WXT entry points (auto-created)
```

---

## EPIC-2: Storage Layer

### 2.1 Define TypeScript Types
**Description**: Create all TypeScript interfaces for sessions, tabs, and windows.

**Acceptance Criteria**:
- [ ] `Session` interface defined
- [ ] `SessionWindow` interface defined
- [ ] `SessionTab` interface defined
- [ ] `SessionMetadata` interface defined
- [ ] All types exported from `src/types/session.ts`

**Files to create**:
- `src/types/session.ts`
- `src/types/index.ts`

**Types to define**:
```typescript
interface Session {
  id: string;
  name: string;
  summary?: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  windows: SessionWindow[];
  tabCount: number;
  windowCount: number;
  isAutoSave: boolean;
  source: 'manual' | 'auto' | 'import';
}

interface SessionWindow {
  id: number;
  focused: boolean;
  incognito: boolean;
  state: 'normal' | 'minimized' | 'maximized' | 'fullscreen';
  tabs: SessionTab[];
}

interface SessionTab {
  id: number;
  index: number;
  url: string;
  title: string;
  favicon?: string;
  pinned: boolean;
  active: boolean;
  groupId?: number;
  groupColor?: string;
  groupTitle?: string;
}
```

---

### 2.2 Create IndexedDB Database Schema
**Description**: Set up the IndexedDB database with proper schema and indexes.

**Acceptance Criteria**:
- [ ] Database name: `btms-sessions`
- [ ] Object store: `sessions` with keyPath `id`
- [ ] Index on `createdAt` for sorting
- [ ] Index on `name` for searching
- [ ] Index on `tags` for filtering (multiEntry)
- [ ] Version migration strategy defined

**Files to create**:
- `src/services/storage/db.ts`

**Schema**:
```typescript
const DB_NAME = 'btms-sessions';
const DB_VERSION = 1;
const SESSIONS_STORE = 'sessions';

// Indexes:
// - createdAt (for sorting by date)
// - updatedAt (for sorting by last modified)
// - name (for searching)
// - tags (multiEntry for filtering)
```

---

### 2.3 Create Database Connection Utility
**Description**: Create a utility to open and manage IndexedDB connections.

**Acceptance Criteria**:
- [ ] `openDatabase()` function that returns Promise<IDBDatabase>
- [ ] Handles version upgrades
- [ ] Creates object stores and indexes on upgrade
- [ ] Error handling for connection failures
- [ ] Singleton pattern to reuse connections

**Files to create**:
- `src/services/storage/connection.ts`

---

### 2.4 Implement Session CRUD - Create
**Description**: Implement the create operation for sessions.

**Acceptance Criteria**:
- [ ] `createSession(session: Omit<Session, 'id'>): Promise<Session>`
- [ ] Generates UUID for new session
- [ ] Sets `createdAt` and `updatedAt` to current timestamp
- [ ] Returns the created session with ID

**Files to modify**:
- `src/services/storage/sessions.ts`

---

### 2.5 Implement Session CRUD - Read
**Description**: Implement read operations for sessions.

**Acceptance Criteria**:
- [ ] `getSession(id: string): Promise<Session | null>`
- [ ] `getAllSessions(): Promise<Session[]>`
- [ ] `getSessionsByTag(tag: string): Promise<Session[]>`
- [ ] Results sorted by `updatedAt` descending by default

**Files to modify**:
- `src/services/storage/sessions.ts`

---

### 2.6 Implement Session CRUD - Update
**Description**: Implement the update operation for sessions.

**Acceptance Criteria**:
- [ ] `updateSession(id: string, updates: Partial<Session>): Promise<Session>`
- [ ] Automatically updates `updatedAt` timestamp
- [ ] Merges updates with existing session
- [ ] Throws error if session not found

**Files to modify**:
- `src/services/storage/sessions.ts`

---

### 2.7 Implement Session CRUD - Delete
**Description**: Implement delete operations for sessions.

**Acceptance Criteria**:
- [ ] `deleteSession(id: string): Promise<void>`
- [ ] `deleteAllSessions(): Promise<void>`
- [ ] `deleteSessions(ids: string[]): Promise<void>` for bulk delete
- [ ] No error if session doesn't exist

**Files to modify**:
- `src/services/storage/sessions.ts`

---

### 2.8 Create Storage Service Class
**Description**: Create a unified StorageService class that wraps all storage operations.

**Acceptance Criteria**:
- [ ] `StorageService` class with all CRUD methods
- [ ] Singleton pattern
- [ ] Event emitter for storage changes
- [ ] Export from `src/services/storage/index.ts`

**Files to create**:
- `src/services/storage/StorageService.ts`
- `src/services/storage/index.ts`

---

### 2.9 Create TanStack Query Hooks for Storage
**Description**: Create React Query hooks for session data fetching and mutations.

**Acceptance Criteria**:
- [ ] `useSession(id)` - Fetch single session
- [ ] `useSessions()` - Fetch all sessions
- [ ] `useCreateSession()` - Mutation for creating
- [ ] `useUpdateSession()` - Mutation for updating
- [ ] `useDeleteSession()` - Mutation for deleting
- [ ] Proper cache invalidation on mutations

**Files to create**:
- `src/hooks/useSession.ts`
- `src/hooks/useSessions.ts`
- `src/hooks/useSessionMutations.ts`

---

## EPIC-3: Core Session Logic

### 3.1 Create Tab Capture Utility
**Description**: Create utility to capture current tabs using chrome.tabs API.

**Acceptance Criteria**:
- [ ] `captureAllTabs(): Promise<SessionTab[]>`
- [ ] Captures URL, title, favicon, pinned state
- [ ] Captures tab group info if available
- [ ] Filters out chrome:// and extension:// URLs (configurable)

**Files to create**:
- `src/services/sessions/capture.ts`

**Chrome API usage**:
```typescript
const tabs = await chrome.tabs.query({});
const groups = await chrome.tabGroups.query({});
```

---

### 3.2 Create Window Capture Utility
**Description**: Create utility to capture all windows with their tabs.

**Acceptance Criteria**:
- [ ] `captureAllWindows(): Promise<SessionWindow[]>`
- [ ] Captures window state (normal, minimized, maximized)
- [ ] Captures focused state
- [ ] Captures incognito status (if permission granted)
- [ ] Each window includes its tabs

**Files to modify**:
- `src/services/sessions/capture.ts`

---

### 3.3 Create Session Snapshot Function
**Description**: Create a function that captures the complete current browser state as a session.

**Acceptance Criteria**:
- [ ] `captureSession(options?: CaptureOptions): Promise<SessionData>`
- [ ] Options: includeIncognito, excludeUrls, name
- [ ] Returns complete session data ready for storage
- [ ] Calculates tabCount and windowCount

**Files to create**:
- `src/services/sessions/snapshot.ts`

---

### 3.4 Create Tab Restore Utility
**Description**: Create utility to restore tabs from session data.

**Acceptance Criteria**:
- [ ] `restoreTabs(tabs: SessionTab[], windowId?: number): Promise<void>`
- [ ] Restores pinned state
- [ ] Handles tab groups (Chrome-specific)
- [ ] Option for lazy loading (don't load until focused)

**Files to create**:
- `src/services/sessions/restore.ts`

---

### 3.5 Create Window Restore Utility
**Description**: Create utility to restore windows with their tabs.

**Acceptance Criteria**:
- [ ] `restoreWindow(window: SessionWindow): Promise<number>` (returns new window ID)
- [ ] Restores window state if possible
- [ ] Creates window, then restores tabs
- [ ] Handles incognito windows

**Files to modify**:
- `src/services/sessions/restore.ts`

---

### 3.6 Create Session Restore Function
**Description**: Create a function that restores a complete session.

**Acceptance Criteria**:
- [ ] `restoreSession(session: Session, options?: RestoreOptions): Promise<void>`
- [ ] Options: replaceCurrentWindows, openInNewWindow, lazyLoad
- [ ] Restores all windows and tabs
- [ ] Progress callback for UI feedback

**Files to create**:
- `src/services/sessions/restore-session.ts`

---

### 3.7 Create Session Service Class
**Description**: Create a unified SessionService class for all session operations.

**Acceptance Criteria**:
- [ ] `saveCurrentSession(name?: string): Promise<Session>`
- [ ] `restoreSession(sessionId: string, options?): Promise<void>`
- [ ] `deleteSession(sessionId: string): Promise<void>`
- [ ] Integrates with StorageService
- [ ] Export from `src/services/sessions/index.ts`

**Files to create**:
- `src/services/sessions/SessionService.ts`
- `src/services/sessions/index.ts`

---

### 3.8 Generate Unique Session IDs
**Description**: Create a utility for generating unique session IDs.

**Acceptance Criteria**:
- [ ] `generateSessionId(): string`
- [ ] Uses crypto.randomUUID() if available
- [ ] Fallback to custom UUID implementation
- [ ] IDs are URL-safe

**Files to create**:
- `src/lib/uuid.ts`

---

### 3.9 Create Date/Time Formatting Utilities
**Description**: Create utilities for formatting dates and times for display.

**Acceptance Criteria**:
- [ ] `formatDate(timestamp: number): string` - e.g., "Dec 22, 2025"
- [ ] `formatTime(timestamp: number): string` - e.g., "10:30 AM"
- [ ] `formatRelative(timestamp: number): string` - e.g., "2 hours ago"
- [ ] Uses Intl.DateTimeFormat for localization

**Files to create**:
- `src/lib/date.ts`

---

# PHASE 2: AI INTEGRATION

## EPIC-4: Chrome AI Service

### 4.1 Create Chrome AI Type Definitions
**Description**: Create TypeScript type definitions for Chrome Built-in AI.

**Acceptance Criteria**:
- [ ] `LanguageModelSession` interface
- [ ] `LanguageModelCreateOptions` interface
- [ ] `LanguageModel` global declaration
- [ ] Availability status types

**Files to create**:
- `src/types/chrome-ai.ts`

**Types**:
```typescript
interface LanguageModelSession {
  inputUsage: number;
  inputQuota: number;
  topK: number;
  temperature: number;
  onquotaoverflow: (() => void) | null;
  prompt(input: string): Promise<string>;
  promptStreaming(input: string): ReadableStream<string>;
  destroy(): void;
}

interface LanguageModelCreateOptions {
  expectedInputLanguages?: string[];
  expectedOutputLanguages?: string[];
  topK?: number;
  temperature?: number;
}

type LanguageModelAvailability = 'available' | 'readily' | 'downloadable' | 'no';
```

---

### 4.2 Create Chrome AI Availability Check
**Description**: Create a function to check if Chrome AI is available.

**Acceptance Criteria**:
- [ ] `checkChromeAIAvailability(): Promise<ChromeAIStatus>`
- [ ] Returns status: available, downloadable, or unavailable
- [ ] Returns reason if unavailable
- [ ] Handles all error cases gracefully

**Files to create**:
- `src/services/ai/availability.ts`

---

### 4.3 Create Chrome AI Session Manager
**Description**: Create a manager for Chrome AI sessions with caching.

**Acceptance Criteria**:
- [ ] `getSession(options?): Promise<LanguageModelSession>`
- [ ] Reuses existing session if valid
- [ ] Creates new session with default options
- [ ] Handles session quota overflow
- [ ] Auto-destroys old sessions

**Files to create**:
- `src/services/ai/session-manager.ts`

---

### 4.4 Create AI Prompt Builder
**Description**: Create utilities for building consistent AI prompts.

**Acceptance Criteria**:
- [ ] `buildSessionNamePrompt(tabs: SessionTab[]): string`
- [ ] `buildSessionSummaryPrompt(session: Session): string`
- [ ] `buildTagSuggestionPrompt(session: Session): string`
- [ ] Prompts optimized for Gemini Nano (~9k context)

**Files to create**:
- `src/services/ai/prompts.ts`

---

### 4.5 Create Fallback AI Interface
**Description**: Create an interface for fallback AI providers.

**Acceptance Criteria**:
- [ ] `AIProvider` interface with standard methods
- [ ] `LocalFallbackProvider` - Simple heuristic fallback
- [ ] Method: `generateSessionName(tabs): Promise<string>`
- [ ] Method: `generateSummary(session): Promise<string>`

**Files to create**:
- `src/services/ai/fallback.ts`
- `src/services/ai/types.ts`

---

### 4.6 Create AI Service Class
**Description**: Create unified AIService that handles Chrome AI and fallback.

**Acceptance Criteria**:
- [ ] `AIService` class with singleton pattern
- [ ] `generateSessionName(tabs): Promise<string>`
- [ ] `generateSummary(session): Promise<string>`
- [ ] `suggestTags(session): Promise<string[]>`
- [ ] Automatic fallback when Chrome AI unavailable
- [ ] Configuration for temperature, topK

**Files to create**:
- `src/services/ai/AIService.ts`
- `src/services/ai/index.ts`

---

### 4.7 Create useAI Hook
**Description**: Create React hook for AI operations in components.

**Acceptance Criteria**:
- [ ] `useAI()` hook returning AIService methods
- [ ] `useAIStatus()` hook for availability status
- [ ] Loading states for all operations
- [ ] Error handling with user-friendly messages

**Files to create**:
- `src/hooks/useAI.ts`

---

## EPIC-5: AI Features

### 5.1 Implement Session Name Generation
**Description**: Implement AI-powered session name generation.

**Acceptance Criteria**:
- [ ] Generates 2-4 word descriptive name
- [ ] Based on tab titles and URLs
- [ ] Consistent formatting (Title Case)
- [ ] User can regenerate if not satisfied
- [ ] Loading state during generation

**Files to modify**:
- `src/services/ai/AIService.ts`

**Prompt template**:
```
Generate a short 2-4 word name for a browser session containing these tabs.
Rules:
- Use title case
- Be descriptive but concise
- Focus on the main topic
- Only respond with the name, nothing else

Tabs:
{tabList}
```

---

### 5.2 Implement Session Summary Generation
**Description**: Implement AI-powered session summary (one-liner).

**Acceptance Criteria**:
- [ ] Generates max 15 word summary
- [ ] Describes what the session is about
- [ ] Useful for quick scanning in lists
- [ ] Generated on session save

**Files to modify**:
- `src/services/ai/AIService.ts`

---

### 5.3 Implement Tag Suggestion
**Description**: Implement AI-powered tag suggestions.

**Acceptance Criteria**:
- [ ] Suggests 3-5 relevant tags
- [ ] Tags are lowercase, no spaces
- [ ] Based on tab content and URLs
- [ ] User can accept/reject suggestions

**Files to modify**:
- `src/services/ai/AIService.ts`

---

### 5.4 Add AI to Session Save Flow
**Description**: Integrate AI features into the session save workflow.

**Acceptance Criteria**:
- [ ] Auto-generate name when saving session
- [ ] Auto-generate summary after save
- [ ] Option to skip AI generation
- [ ] Show loading states in UI

**Files to modify**:
- `src/services/sessions/SessionService.ts`

---

# PHASE 3: UI/UX

## EPIC-6: Popup UI

### 6.1 Create Popup Layout Component
**Description**: Create the main layout structure for the popup.

**Acceptance Criteria**:
- [ ] Fixed dimensions (400x500px default)
- [ ] Header with title and action buttons
- [ ] Main content area with scroll
- [ ] Footer with status info
- [ ] Dark mode support

**Files to create**:
- `src/components/PopupLayout.tsx`

---

### 6.2 Create Header Component
**Description**: Create the popup header with branding and actions.

**Acceptance Criteria**:
- [ ] BTMS logo/title
- [ ] "Save Session" button (primary action)
- [ ] Settings icon button
- [ ] Search toggle button

**Files to create**:
- `src/components/Header.tsx`

---

### 6.3 Create Save Session Button
**Description**: Create the primary "Save Session" button with loading state.

**Acceptance Criteria**:
- [ ] Prominent styling (primary color)
- [ ] Shows loading spinner during save
- [ ] Success feedback animation
- [ ] Disabled state when appropriate

**Files to create**:
- `src/components/SaveButton.tsx`

---

### 6.4 Create Empty State Component
**Description**: Create a component for when there are no sessions.

**Acceptance Criteria**:
- [ ] Friendly illustration or icon
- [ ] Helpful message explaining what to do
- [ ] "Save Your First Session" CTA button
- [ ] Consistent with overall design

**Files to create**:
- `src/components/EmptyState.tsx`

---

### 6.5 Create Loading State Component
**Description**: Create a loading spinner/skeleton component.

**Acceptance Criteria**:
- [ ] Spinner animation
- [ ] Skeleton loader for lists
- [ ] Smooth transitions
- [ ] Configurable size

**Files to create**:
- `src/components/Loading.tsx`
- `src/components/Skeleton.tsx`

---

### 6.6 Wire Up Popup Entry Point
**Description**: Connect all popup components to the entry point.

**Acceptance Criteria**:
- [ ] QueryClientProvider setup
- [ ] PopupLayout rendering
- [ ] Header with working buttons
- [ ] Session list (even if empty)
- [ ] Basic styling applied

**Files to modify**:
- `src/entrypoints/popup/App.tsx`
- `src/entrypoints/popup/main.tsx`

---

## EPIC-7: Session List Component

### 7.1 Create Session Card Component
**Description**: Create a card component for displaying a single session.

**Acceptance Criteria**:
- [ ] Session name (editable on click)
- [ ] Summary text (if available)
- [ ] Tab count and window count badges
- [ ] Relative date ("2 hours ago")
- [ ] Tags display
- [ ] Hover state with actions

**Files to create**:
- `src/components/SessionCard.tsx`

---

### 7.2 Create Session Actions Menu
**Description**: Create the action menu for session cards.

**Acceptance Criteria**:
- [ ] "Open" button (primary)
- [ ] "Open in new window" option
- [ ] "Edit" option
- [ ] "Delete" option with confirmation
- [ ] Keyboard accessible

**Files to create**:
- `src/components/SessionActions.tsx`

---

### 7.3 Create Session List with TanStack Table
**Description**: Implement the session list using TanStack Table.

**Acceptance Criteria**:
- [ ] Table configuration with columns
- [ ] Sorting by name, date, tab count
- [ ] Column visibility toggle
- [ ] Virtual scrolling for large lists
- [ ] Integration with TanStack Virtual

**Files to create**:
- `src/components/SessionList.tsx`
- `src/components/SessionTable.tsx`

---

### 7.4 Create Search/Filter Bar
**Description**: Create the search and filter controls.

**Acceptance Criteria**:
- [ ] Text search input
- [ ] Filter by tags (multi-select)
- [ ] Sort dropdown (date, name, tabs)
- [ ] Clear filters button
- [ ] Collapsible on mobile

**Files to create**:
- `src/components/SearchBar.tsx`
- `src/components/FilterControls.tsx`

---

### 7.5 Implement Search Functionality
**Description**: Implement client-side search for sessions.

**Acceptance Criteria**:
- [ ] Search by session name
- [ ] Search by tab titles (within session)
- [ ] Debounced input (300ms)
- [ ] Highlight matching text
- [ ] No results state

**Files to create**:
- `src/hooks/useSessionSearch.ts`

---

### 7.6 Create Delete Confirmation Dialog
**Description**: Create a confirmation dialog for delete actions.

**Acceptance Criteria**:
- [ ] Modal overlay
- [ ] Warning message
- [ ] Cancel and Confirm buttons
- [ ] Keyboard support (Escape to close)
- [ ] Focus trap

**Files to create**:
- `src/components/ConfirmDialog.tsx`

---

### 7.7 Create Session Edit Modal
**Description**: Create a modal for editing session details.

**Acceptance Criteria**:
- [ ] Edit session name
- [ ] Edit/regenerate summary
- [ ] Manage tags
- [ ] View tab list (read-only)
- [ ] Save and Cancel buttons

**Files to create**:
- `src/components/SessionEditModal.tsx`

---

## EPIC-8: Settings Page

### 8.1 Create Settings Layout
**Description**: Create the options page layout.

**Acceptance Criteria**:
- [ ] Full page layout
- [ ] Navigation sidebar
- [ ] Main content area
- [ ] Consistent with popup styling

**Files to create**:
- `src/components/SettingsLayout.tsx`

---

### 8.2 Create Settings Store
**Description**: Create Zustand store for user settings.

**Acceptance Criteria**:
- [ ] Theme preference (light/dark/system)
- [ ] Auto-save enabled (boolean)
- [ ] Auto-save interval (minutes)
- [ ] Excluded URLs (array)
- [ ] AI enabled (boolean)
- [ ] Persist to chrome.storage.sync

**Files to create**:
- `src/stores/settingsStore.ts`

---

### 8.3 Create General Settings Section
**Description**: Create the general settings section.

**Acceptance Criteria**:
- [ ] Theme selector
- [ ] Extension name display
- [ ] Version info
- [ ] Reset to defaults button

**Files to create**:
- `src/components/settings/GeneralSettings.tsx`

---

### 8.4 Create Auto-save Settings Section
**Description**: Create settings for auto-save behavior.

**Acceptance Criteria**:
- [ ] Enable/disable toggle
- [ ] Interval slider (1-60 minutes)
- [ ] Max auto-saves limit
- [ ] "Save on window close" toggle

**Files to create**:
- `src/components/settings/AutoSaveSettings.tsx`

---

### 8.5 Create AI Settings Section
**Description**: Create settings for AI features.

**Acceptance Criteria**:
- [ ] Enable/disable AI
- [ ] AI status display
- [ ] "Download model" button if downloadable
- [ ] Test AI button

**Files to create**:
- `src/components/settings/AISettings.tsx`

---

### 8.6 Create Exclude URLs Section
**Description**: Create settings for URL exclusion patterns.

**Acceptance Criteria**:
- [ ] List of excluded URL patterns
- [ ] Add new pattern input
- [ ] Edit existing patterns
- [ ] Delete patterns
- [ ] Pattern syntax help

**Files to create**:
- `src/components/settings/ExcludeURLs.tsx`

---

### 8.7 Wire Up Options Entry Point
**Description**: Connect settings components to options page.

**Acceptance Criteria**:
- [ ] All settings sections rendered
- [ ] Settings persist on change
- [ ] Settings sync across devices
- [ ] Proper loading states

**Files to modify**:
- `src/entrypoints/options/App.tsx`

---

# PHASE 4: POLISH

## EPIC-9: Auto-save & Background

### 9.1 Create Background Service Worker
**Description**: Set up the background service worker for auto-save.

**Acceptance Criteria**:
- [ ] Service worker initializes on install
- [ ] Loads settings from storage
- [ ] Sets up alarm for auto-save
- [ ] Handles messages from popup

**Files to modify**:
- `src/entrypoints/background.ts`

---

### 9.2 Implement Window Close Detection
**Description**: Detect when windows are being closed for auto-save.

**Acceptance Criteria**:
- [ ] Listen to `chrome.windows.onRemoved`
- [ ] Check if "save on close" is enabled
- [ ] Save session before window closes
- [ ] Don't duplicate saves

**Files to modify**:
- `src/entrypoints/background.ts`

---

### 9.3 Implement Interval Auto-save
**Description**: Implement periodic auto-save using alarms.

**Acceptance Criteria**:
- [ ] Use `chrome.alarms` API
- [ ] Configurable interval from settings
- [ ] Auto-save marked with `isAutoSave: true`
- [ ] Limit number of auto-saves (cleanup old ones)

**Files to modify**:
- `src/entrypoints/background.ts`

---

### 9.4 Create Auto-save Cleanup
**Description**: Implement cleanup of old auto-saves.

**Acceptance Criteria**:
- [ ] Keep only N most recent auto-saves
- [ ] N configurable in settings (default: 10)
- [ ] Never delete manual saves
- [ ] Run cleanup after each auto-save

**Files to create**:
- `src/services/sessions/cleanup.ts`

---

## EPIC-10: Import/Export

### 10.1 Implement Session Export
**Description**: Implement exporting sessions to JSON file.

**Acceptance Criteria**:
- [ ] Export single session
- [ ] Export all sessions
- [ ] JSON format with metadata
- [ ] Download as file
- [ ] Filename includes date

**Files to create**:
- `src/services/export/export.ts`

---

### 10.2 Implement Session Import
**Description**: Implement importing sessions from JSON file.

**Acceptance Criteria**:
- [ ] File picker for JSON
- [ ] Validate JSON structure
- [ ] Handle duplicates (skip/overwrite/rename)
- [ ] Progress indicator for large imports
- [ ] Error handling with details

**Files to create**:
- `src/services/export/import.ts`

---

### 10.3 Create Import/Export UI
**Description**: Create UI for import/export in settings.

**Acceptance Criteria**:
- [ ] Export button in settings
- [ ] Import button with file picker
- [ ] Preview before import
- [ ] Success/error feedback

**Files to create**:
- `src/components/settings/ImportExport.tsx`

---

### 10.4 Add Export to Session Actions
**Description**: Add export option to session action menu.

**Acceptance Criteria**:
- [ ] "Export" option in dropdown
- [ ] Exports single session
- [ ] Quick download

**Files to modify**:
- `src/components/SessionActions.tsx`

---

## EPIC-11: Testing & Quality

### 11.1 Set Up Testing Framework
**Description**: Configure testing with Vitest.

**Acceptance Criteria**:
- [ ] Vitest installed and configured
- [ ] Test script in package.json
- [ ] Coverage reporting
- [ ] Watch mode for development

**Commands**:
```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

---

### 11.2 Write Storage Service Tests
**Description**: Write unit tests for StorageService.

**Acceptance Criteria**:
- [ ] Test CRUD operations
- [ ] Test error handling
- [ ] Mock IndexedDB
- [ ] 80%+ coverage for storage

---

### 11.3 Write Session Service Tests
**Description**: Write unit tests for SessionService.

**Acceptance Criteria**:
- [ ] Test capture functionality
- [ ] Test restore functionality
- [ ] Mock chrome APIs
- [ ] 80%+ coverage for sessions

---

### 11.4 Write AI Service Tests
**Description**: Write unit tests for AIService.

**Acceptance Criteria**:
- [ ] Test availability check
- [ ] Test fallback behavior
- [ ] Mock LanguageModel
- [ ] Test prompt building

---

### 11.5 Create Manual Test Checklist
**Description**: Create a checklist for manual testing.

**Acceptance Criteria**:
- [ ] Save session works
- [ ] Restore session works
- [ ] AI naming works
- [ ] Search works
- [ ] Settings persist
- [ ] Dark mode works

**Files to create**:
- `docs/testing/manual-checklist.md`

---

### 11.6 Performance Optimization
**Description**: Optimize performance for large session lists.

**Acceptance Criteria**:
- [ ] Virtual scrolling working
- [ ] No lag with 100+ sessions
- [ ] Lazy loading for session details
- [ ] Memoization where appropriate

---

### 11.7 Accessibility Audit
**Description**: Ensure accessibility compliance.

**Acceptance Criteria**:
- [ ] Keyboard navigation throughout
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader friendly

---

### 11.8 Final Polish
**Description**: Final UI/UX polish before release.

**Acceptance Criteria**:
- [ ] Consistent spacing
- [ ] Smooth animations
- [ ] Error states handled
- [ ] Loading states everywhere
- [ ] Empty states look good

---

## Summary Statistics

| Phase | Epics | Tasks |
|-------|-------|-------|
| Foundation | 3 | 18 |
| AI Integration | 2 | 11 |
| UI/UX | 3 | 20 |
| Polish | 3 | 12 |
| **Total** | **11** | **61** |

---

*Created: 2025-12-22*
*Last updated: 2025-12-22*
