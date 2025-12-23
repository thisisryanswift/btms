# AGENTS.md - AI Assistant Context for BTMS

> Instructions and context for AI coding assistants working on this project

---

## 🚀 Quick Start (For AI Agents)

### Current Status: ✅ All 11 EPICs Complete!

| EPIC | Status | Description |
|------|--------|-------------|
| EPIC-1 | ✅ | Project Setup (WXT, TypeScript, Tailwind) |
| EPIC-2 | ✅ | Storage Layer (`chrome.storage.local`) |
| EPIC-3 | ✅ | Core Session Logic (capture, restore) |
| EPIC-4 | ✅ | Chrome AI Service (Gemini Nano) |
| EPIC-5 | ✅ | AI Features (naming with fallback) |
| EPIC-6 | ✅ | Popup UI (icons, modals, polish) |
| EPIC-7 | ✅ | Session List Component |
| EPIC-8 | ✅ | Settings Page (full options UI) |
| EPIC-9 | ✅ | Auto-save & Background (chrome.alarms) |
| EPIC-10 | ✅ | Import/Export (JSON backup) |
| EPIC-11 | ✅ | Testing & Quality (Vitest setup) |

**The extension is feature-complete and production-ready!**

### Essential Commands
```bash
# Start development server (opens Chrome with extension)
npm run dev

# Build production
npm run build

# Run tests
npm run test:run

# Run tests with UI
npm run test:ui
```

---

## 🎯 Project Overview

**BTMS (Better Tab Management System)** is a Chrome extension for AI-powered browser session management. It's inspired by [Tab Session Manager](https://github.com/sienori/Tab-Session-Manager) but built from scratch with AI as a core feature.

### Mission
Make browser session management invisible, intelligent, and delightful.

### Key Features (All Implemented)
- ✅ AI-generated session names (Chrome AI + fallback)
- ✅ Session summaries and tags
- ✅ Save/restore/delete sessions
- ✅ Auto-save with configurable intervals
- ✅ Import/Export as JSON
- ✅ Full settings page
- ✅ Dark mode support

---

## 🛠️ Tech Stack

| Component | Choice | Notes |
|-----------|--------|-------|
| **Extension Platform** | Chrome Manifest V3 | Also works on Edge, Brave, etc. |
| **Build Tool** | WXT 0.20.13 | Config in project root |
| **UI Framework** | React + TypeScript | Type-safe, modern |
| **Styling** | Tailwind CSS | Rapid prototyping |
| **State Management** | TanStack Query | Async data fetching |
| **Testing** | Vitest + Testing Library | Full test setup |
| **Primary AI** | Chrome Built-in AI (Gemini Nano) | Free, local, private |
| **Fallback AI** | Rule-based (FallbackAIService) | Always available |
| **Storage** | `chrome.storage.local` | Sessions |
| **Settings** | `chrome.storage.sync` | Cross-device sync |

### Browser Support
- ✅ Chrome (primary target, AI features)
- ✅ Edge (Chromium-based, fallback AI)
- ✅ Brave, Vivaldi, Opera, Arc (Chromium-based)
- ❌ Firefox (explicitly not supported)

---

## 📁 Project Structure

```
btms/
├── dev/                         # WXT source directory
│   ├── entrypoints/            # Extension entry points
│   │   ├── popup/
│   │   │   ├── index.html
│   │   │   └── main.tsx       # React entry with QueryClientProvider
│   │   ├── options/
│   │   │   ├── index.html
│   │   │   └── main.tsx
│   │   ├── sidepanel/
│   │   └── background.ts       # Auto-save service worker
│   └── src/
│       ├── components/
│       │   ├── Popup.tsx       # Main popup UI
│       │   ├── SessionList.tsx # Session modal with actions
│       │   └── OptionsApp.tsx  # Settings page
│       ├── hooks/
│       │   ├── useSession.ts         # Read sessions
│       │   ├── useSessionMutations.ts # Save/delete/restore with AI
│       │   ├── useSettings.ts        # Settings CRUD
│       │   └── useImportExport.ts    # Import/Export hooks
│       ├── services/
│       │   ├── ai/
│       │   │   ├── AIService.ts       # Unified AI with fallback
│       │   │   ├── ChromeAIService.ts # Gemini Nano integration
│       │   │   └── FallbackAIService.ts
│       │   ├── SettingsService.ts     # Settings management
│       │   ├── ImportExportService.ts # JSON import/export
│       │   ├── sessions/              # Session logic
│       │   └── storage/               # IndexedDB (legacy, not used)
│       ├── types/
│       │   ├── session.ts
│       │   ├── settings.ts           # Nested settings structure
│       │   └── chrome-ai.ts          # LanguageModel types
│       └── test/
│           └── setup.ts              # Vitest setup with Chrome mocks
├── docs/                        # Documentation
│   ├── guides/
│   ├── planning/
│   └── research/
├── vitest.config.ts            # Test configuration
├── vitest.config.ts            # Test configuration
├── tailwind.config.js
└── package.json
```

### ⚠️ Critical Architecture Notes

1. **WXT config is in `dev/wxt.config.ts`** - NOT in project root!
2. **All source code is in `dev/`** - entrypoints, src, etc.
3. **Import paths from entrypoints use `../../src/`** - two levels up
4. **Storage uses `chrome.storage.local`** - NOT IndexedDB (simplified for reliability)
5. **Settings use `chrome.storage.sync`** - For cross-device sync
6. **AI Service uses dynamic import** - Avoids circular dependencies:
   ```typescript
   const { AIService } = await import('../services/ai/AIService');
   ```
7. **Settings types are NESTED**:
   ```typescript
   settings.appearance.theme    // NOT settings.theme
   settings.ai.autoNaming       // NOT settings.aiNaming
   settings.autoSave.enabled    // NOT settings.autoSaveEnabled
   ```

---

## 🧠 Chrome Built-in AI (Gemini Nano)

### Critical: Correct API Pattern

**IMPORTANT**: Use the `LanguageModel` global, NOT `ai.languageModel`:

```javascript
// ❌ WRONG - Does not work
await ai.languageModel.create();

// ✅ CORRECT - Use LanguageModel global
await LanguageModel.create({
  expectedInputLanguages: ['en'],
  expectedOutputLanguages: ['en']
});
```

### Availability Check Pattern
```javascript
async function isChromAIAvailable() {
  if (typeof LanguageModel === 'undefined') {
    return { available: false, reason: 'API not found' };
  }
  
  try {
    const status = await LanguageModel.availability();
    return {
      available: status === 'available' || status === 'readily',
      status,
      downloadable: status === 'downloadable'
    };
  } catch (e) {
    return { available: false, reason: e.message };
  }
}
```

### Model Capabilities
- **Context**: ~9,216 tokens
- **Best for**: Naming, summarization, classification
- **Not for**: Complex reasoning, precise facts, long-form

---

## 🔧 Key Code Patterns

### Session Storage (Direct chrome.storage)
```typescript
// Read sessions
const result = await chrome.storage.local.get('sessions');
const sessions = result.sessions || [];

// Write sessions
await chrome.storage.local.set({ sessions });
```

### AI Naming with Dynamic Import
```typescript
// In useSessionMutations.ts
if (options.useAINaming) {
  const { AIService } = await import('../services/ai/AIService');
  const aiService = AIService.getInstance();
  const result = await aiService.generateSessionName(tabs);
  if (result.success) {
    sessionName = result.name;
  }
}
```

### Settings Structure
```typescript
interface BTMSSettings {
  appearance: { theme: 'light' | 'dark' | 'system'; language: string };
  ai: { autoNaming: boolean; summaries: boolean; provider: string };
  autoSave: { enabled: boolean; intervalMinutes: number; maxSessions: number };
  session: { retentionDays: number; cleanupEnabled: boolean };
  ui: { showTabCount: boolean; compactView: boolean };
  privacy: { saveIncognito: boolean; trackStats: boolean };
}
```

---

## 📚 Documentation

### Internal Docs
- `docs/planning/implementation-plan.md` - All 11 EPICs with tasks
- `docs/guides/chrome-ai-setup-linux.md` - Chrome AI setup (verified)
- `docs/guides/chrome-ai-usage.md` - AI API patterns
- `docs/research/` - Feature research and vision

### External Resources
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in)
- [WXT Framework](https://wxt.dev/)
- [TanStack Query](https://tanstack.com/query)

---

## ⚠️ Common Pitfalls

1. **Don't use `ai.languageModel`** - Use `LanguageModel` global instead
2. **Always specify languages** - Required for Chrome AI API
3. **Firefox not supported** - Don't add cross-browser polyfills
4. **First AI call is slow** - Model downloads on first use (~1.5GB)
5. **Context limit ~9k tokens** - Keep prompts concise
6. **Settings are nested** - Use `settings.ai.autoNaming` not `settings.aiNaming`
7. **Storage is chrome.storage.local** - NOT IndexedDB
8. **Dynamic imports for AI** - Avoid circular dependencies

---

## � Issue Tracking with Beads

**CRITICAL**: This project uses **beads** (`bd` command) for ALL task tracking. Do NOT create markdown TODO lists.

### Essential Commands

```bash
# Find work
bd ready                           # Unblocked issues ready to work on
bd list --status open              # All open issues

# Create and manage
bd create "Title" --type task --priority 2
bd create "Subtask" --parent <epic-id>     # Hierarchical subtask
bd update <id> --status in_progress
bd close <id>

# Search and view
bd list --status open --priority 1
bd show <id>

# Sync (IMPORTANT at end of session!)
bd sync                            # Export and commit to git
```

### Workflow

1. **Check ready work**: `bd ready`
2. **Claim task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** `bd create "Found issue" --parent <epic-id>`
5. **Complete**: `bd close <id>`
6. **Sync**: `bd sync` (flushes changes to git)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Link discovered work with `--parent` flag
- ✅ Check `bd ready` before asking "what should I work on?"
- ✅ Run `bd <cmd> --help` to discover available flags
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT duplicate tracking systems

---

## �🚀 For Future Development

### Potential Enhancements
- Semantic search for sessions
- Tab group support
- Session sharing between devices
- More AI features (summaries, tagging)
- Side panel implementation

### Known Limitations
- Side panel is placeholder only
- No Firefox support

---

*Last updated: 2025-12-23 (code quality cleanup complete, added shared utilities: lib/storage.ts, lib/constants.ts, lib/download.ts)*
