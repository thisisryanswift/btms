# AGENTS.md - AI Assistant Context for BTMS

> Instructions and context for AI coding assistants working on this project

---

## 🚀 Quick Start (For AI Agents)

### Current Status: EPICs 1-5 Complete ✅
- ✅ EPIC-1: Project Setup
- ✅ EPIC-2: Storage Layer (using `chrome.storage.local`)
- ✅ EPIC-3: Core Session Logic
- ✅ EPIC-4: Chrome AI Service
- ✅ EPIC-5: AI Features (session naming with fallback)

The extension is fully functional with AI-powered session naming!

### Essential Commands
```bash
# Start development server (opens Chrome with extension)
npm run dev

# Build production
npm run build

# Check available Beads issues
bd list

# Get next task to work on
bd ready
```

### ⚠️ Critical Architecture Notes
1. **WXT config is in `dev/wxt.config.ts`** - NOT project root!
2. **All source code is in `dev/`** - entrypoints, src, etc.
3. **Import paths from entrypoints use `../../src/`** - two levels up
4. **Storage uses `chrome.storage.local`** - NOT IndexedDB (simplified for reliability)
5. **AI Service uses dynamic import** - avoids circular dependencies

### Next Steps
1. Work on EPIC-6: Popup UI improvements
2. Work on EPIC-7: Session List Component (View Saved Sessions)
3. See `docs/planning/implementation-plan.md` for details

---

## 🎯 Project Overview

**BTMS (Better Tab Management System)** is a Chrome extension for AI-powered browser session management. It's inspired by [Tab Session Manager](https://github.com/sienori/Tab-Session-Manager) but built from scratch with AI as a core feature.

### Mission
Make browser session management invisible, intelligent, and delightful.

### Key Differentiators
- AI-generated session names and summaries
- Semantic search for sessions
- On-device AI (Chrome Built-in AI / Gemini Nano)
- Modern, clean UI

---

## 🛠️ Tech Stack

### Confirmed Decisions
| Component | Choice | Notes |
|-----------|--------|-------|
| **Extension Platform** | Chrome Manifest V3 | Also works on Edge, Brave, etc. |
| **Build Tool** | WXT 0.20.13 | Config in `dev/wxt.config.ts` |
| **UI Framework** | React + TypeScript | Type-safe, modern |
| **Styling** | Tailwind CSS | Rapid prototyping |
| **State Management** | TanStack Query | Async data fetching |
| **Primary AI** | Chrome Built-in AI (Gemini Nano) | Free, local, private |
| **Fallback AI** | Rule-based (FallbackAIService) | Always available |
| **Storage** | `chrome.storage.local` | Simple, reliable |

### Browser Support
- ✅ Chrome (primary target)
- ✅ Edge (Chromium-based, works automatically)
- ✅ Brave, Vivaldi, Opera, Arc (Chromium-based)
- ❌ Firefox (explicitly not supported for now)

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

### Required Parameters
Always specify languages to avoid warnings:
```javascript
const session = await LanguageModel.create({
  expectedInputLanguages: ['en'],   // Required
  expectedOutputLanguages: ['en'],  // Required
  temperature: 0.3,                 // Optional: 0.0-2.0, default 1.0
  topK: 2,                          // Optional: 1-8, default 3
});
```

### Model Capabilities
- **Context**: ~9,216 tokens
- **Best for**: Naming, summarization, classification, simple Q&A
- **Not for**: Complex reasoning, precise facts, long-form generation

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

### Fallback Pattern
```javascript
async function generateWithFallback(prompt) {
  // Try Chrome Built-in AI first
  if (typeof LanguageModel !== 'undefined') {
    try {
      const availability = await LanguageModel.availability();
      if (availability === 'available' || availability === 'readily') {
        const session = await LanguageModel.create({
          expectedInputLanguages: ['en'],
          expectedOutputLanguages: ['en'],
          temperature: 0.3
        });
        return await session.prompt(prompt);
      }
    } catch (e) {
      console.warn('Chrome AI failed:', e);
    }
  }
  
  // Fallback to cloud/local API
  return fallbackAPI.generate(prompt);
}
```

---

## 📁 Project Structure

**IMPORTANT**: WXT config lives in `dev/` folder, not project root!

```
btms/
├── dev/                         # WXT source directory
│   ├── wxt.config.ts           # WXT config (MUST be here, not root!)
│   ├── entrypoints/            # Extension entry points
│   │   ├── popup/
│   │   │   ├── index.html
│   │   │   └── main.tsx
│   │   ├── options/
│   │   ├── sidepanel/
│   │   └── background.ts
│   ├── src/                    # Shared source code
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # Service classes
│   │   ├── stores/             # Zustand stores
│   │   ├── types/              # TypeScript types
│   │   └── assets/
│   │       └── styles.css      # Tailwind entry
│   └── .output/                # Build output (gitignored)
├── docs/                       # Documentation
├── scripts/                    # Build scripts
├── package.json                # NPM dependencies (root)
├── tsconfig.json               # TypeScript config (root)
├── tailwind.config.js          # Tailwind config (root)
├── postcss.config.js           # PostCSS config (root)
├── AGENTS.md                   # AI assistant context
└── README.md
```

---

## 🎨 UI/UX Principles

1. **AI as Assistant, Not Master**
   - AI suggests, user decides
   - Easy override of all AI decisions
   - Transparent about AI actions

2. **Privacy First**
   - Prefer on-device AI (Chrome Built-in)
   - Clear consent for cloud features
   - No data sold or shared

3. **Progressive Disclosure**
   - Simple by default
   - Power features available but hidden
   - Smart defaults for 80% of users

4. **Delight in Details**
   - Smooth animations
   - Satisfying micro-interactions
   - Thoughtful empty states

---

## 🔧 Development Notes

### Chrome Extension Specifics
- Use Manifest V3 (service workers, not background pages)
- Popup max width: 800px, max height: 600px
- Side panel is Chrome-exclusive (use it!)
- Test with `chrome://extensions` in developer mode

### TypeScript Types for Chrome AI
```typescript
interface LanguageModelSession {
  inputUsage: number;
  inputQuota: number;
  topK: number;
  temperature: number;
  onquotaoverflow: (() => void) | null;
  prompt(input: string): Promise<string>;
}

interface LanguageModelCreateOptions {
  expectedInputLanguages?: string[];
  expectedOutputLanguages?: string[];
  topK?: number;
  temperature?: number;
}

declare const LanguageModel: {
  availability(): Promise<'available' | 'readily' | 'downloadable' | 'no'>;
  create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
};
```

### Session Data Structure
```typescript
interface Session {
  id: string;
  name: string;                    // AI-generated or user-provided
  summary?: string;                // AI-generated one-liner
  createdAt: number;
  updatedAt: number;
  tags: string[];
  windows: Window[];
  tabCount: number;
  isAutoSave: boolean;
}

interface Window {
  id: number;
  focused: boolean;
  incognito: boolean;
  tabs: Tab[];
}

interface Tab {
  id: number;
  url: string;
  title: string;
  favicon?: string;
  pinned: boolean;
  active: boolean;
  groupId?: number;
}
```

---

## 📚 Key Resources

### Documentation
- `docs/guides/chrome-ai-setup-linux.md` - Chrome AI setup (verified working)
- `docs/guides/chrome-ai-usage.md` - AI API usage patterns
- `docs/research/01-tab-session-manager-analysis.md` - Competitor analysis
- `docs/research/02-ai-opportunities.md` - AI feature ideas
- `docs/research/03-project-vision.md` - Roadmap and tech decisions

### External
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in)
- [WXT Framework](https://wxt.dev/) - Modern extension framework
- [TanStack](https://tanstack.com/) - Query, Table, Virtual

---

## 📋 Issue Tracking with Beads

This project uses [Beads](https://github.com/steveyegge/beads) for issue tracking - an AI-native tool designed for coding agents.

### Hierarchy Structure (Jira-like)

Beads supports hierarchical IDs:

| Level | Format | Example | Use For |
|-------|--------|---------|---------|
| **Epic** | `btms-xxxx` | `btms-a3f8` | Large features, milestones |
| **Task** | `btms-xxxx.1` | `btms-a3f8.1` | Individual work items |
| **Sub-task** | `btms-xxxx.1.1` | `btms-a3f8.1.1` | Granular steps |

### Essential Commands

```bash
# View issues
bd list                      # All issues
bd ready                     # Issues ready to work on (no blockers)
bd show <id>                 # Issue details

# Create issues  
bd create "Title"            # Create task
bd create "Title" -p 0       # Create with priority 0 (highest)
bd create "Title" --parent btms-xxx  # Create as child

# Update issues
bd update <id> --status in_progress
bd update <id> --status done
bd update <id> --priority 1

# Dependencies
bd dep add <child> <parent>  # Child depends on parent
bd dep list <id>             # Show dependencies
```

### Issue Statuses

- `open` - Not started
- `in_progress` - Being worked on
- `blocked` - Waiting on something
- `done` - Completed
- `wontfix` - Won't be done

### Dependency Types

- **blocks** - Hard dependency (can't start until other is done)
- **related** - Soft connection
- **parent** - Hierarchical relationship
- **discovered-from** - Issue found while working on another

### Workflow for AI Agents

1. **Before starting work**: Run `bd ready` to see available tasks
2. **Pick a task**: Run `bd update <id> --status in_progress`
3. **If blocked**: Use `bd update <id> --status blocked --reason "reason"`
4. **When done**: Run `bd update <id> --status done`
5. **Discovered new issue**: Run `bd create "New issue" --discovered-from <current-id>`

### Current Structure

```
Epics (planned - not yet created):
├── MVP Foundation
│   ├── Project setup
│   ├── Core session logic
│   └── Storage layer
├── AI Features
│   ├── Chrome AI integration
│   ├── Session naming
│   └── Summaries
└── UI/UX
    ├── Popup
    ├── Session list
    └── Search
```

---

## ⚠️ Common Pitfalls

1. **Don't use `ai.languageModel`** - Use `LanguageModel` global instead
2. **Always specify languages** - Required for Chrome AI API
3. **Firefox not supported** - Don't add cross-browser polyfills
4. **First AI call is slow** - Model downloads on first use (~1.5GB)
5. **Context limit ~9k tokens** - Keep prompts concise
6. **No system prompts** - Embed instructions in user prompt
7. **Use `bd ready`** - Check for available tasks before starting work
8. **Update issue status** - Keep Beads in sync with your progress

---

## 🚀 Getting Started (for AI assistants)

When starting work on this project:

1. **Run `bd ready`** - See what tasks are available
2. **Check existing docs** first - Research phase is complete
3. **Use Chrome AI** as primary - It's verified working
4. **Follow TanStack patterns** - User wants to learn these libraries
5. **Manifest V3 only** - No legacy background pages
6. **TypeScript required** - Type everything properly
7. **Tailwind for styling** - No custom CSS unless necessary
8. **Update Beads** - Mark tasks in_progress/done as you work

---

*Last updated: 2025-12-22*
