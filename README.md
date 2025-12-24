# BTMS - Better Tab & Session Manager

> 🧠 An AI-first Chrome extension for intelligent browser session management

## 🎉 Project Status

**✅ Feature Complete!** All 11 EPICs completed.

BTMS is a modern, AI-powered browser extension that makes managing browser sessions invisible, intelligent, and delightful.

## ✨ Features

### Core Session Management
- **Save Sessions** - Capture all open tabs with one click
- **Restore Sessions** - Reopen entire sessions in new windows
- **Lazy Tab Loading** - Restore tabs without loading until clicked (faster restore)
- **View Sessions** - Browse saved sessions with expandable details
- **Edit Sessions** - Modify session names and tags
- **Delete Sessions** - Remove sessions with confirmation dialog
- **Session Search** - Filter by name, tags, or tab content with debounce

### AI-Powered Features
- **Smart Naming** - AI generates meaningful session names based on tab content
- **Chrome Built-in AI** - Uses local Gemini Nano (no API keys, free, private)
- **AI Response Caching** - Cached results for better performance
- **Rule-based Fallback** - Works even when AI isn't available

### Additional Features
- **Auto-save** - Automatic periodic saves with configurable intervals
- **Startup Autosave** - Capture browser state when Chrome launches
- **Browser Close Detection** - Auto-saves when closing Chrome
- **Import/Export** - Backup and restore sessions as JSON files
- **Settings Page** - Full preferences UI (theme, AI options, auto-save config)
- **Dark Mode** - Full dark mode support throughout


## 🚀 Quick Start

### Prerequisites
- Chrome 127+ (for Chrome Built-in AI support)
- Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/rswift/btms.git
cd btms

# Install dependencies
npm install

# Start development server
npm run dev
```

This will open Chrome with the extension loaded. The popup appears when you click the BTMS icon.

### Build for Production

```bash
npm run build
```

Output will be in `.output/chrome-mv3/`

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests once
npm run test:run

# Run with UI
npm run test:ui
```

## 📁 Project Structure

```
btms/                          # Project root (flat WXT structure)
├── entrypoints/               # Extension entry points
│   ├── popup/                 # Main popup UI
│   ├── options.open-in-tab/   # Settings page
│   ├── sidepanel/             # Side panel
│   └── background.ts          # Service worker for auto-save
├── src/
│   ├── components/            # React components
│   │   ├── Popup.tsx
│   │   ├── SessionList.tsx
│   │   ├── SessionItem.tsx
│   │   └── OptionsApp.tsx
│   ├── hooks/                 # TanStack Query hooks
│   ├── lib/                   # Shared utilities
│   ├── services/              # AI, Import/Export, Settings
│   ├── types/                 # TypeScript types
│   └── test/                  # Test setup and mocks
├── docs/                      # Documentation
├── wxt.config.ts              # WXT configuration
├── vitest.config.ts           # Test configuration
└── package.json
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Build Tool** | WXT 0.20.13 |
| **UI Framework** | React + TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | TanStack Query |
| **Testing** | Vitest + Testing Library |
| **Primary AI** | Chrome Built-in AI (Gemini Nano) |
| **Fallback AI** | Rule-based service |
| **Storage** | `chrome.storage.local` (sessions), `chrome.storage.sync` (settings) |

## 🧠 Chrome Built-in AI

BTMS uses Chrome's experimental Built-in AI feature (Gemini Nano) for on-device AI processing. This provides:
- **Free** - No API keys or subscriptions needed
- **Private** - All processing happens locally on your device  
- **Fast** - No network latency after initial model download

### Enable Chrome AI

To unlock AI-powered session naming, summaries, and tags:

1. **Open Chrome Flags** - Navigate to `chrome://flags`

2. **Enable these two flags:**

   | Flag | Set To |
   |------|--------|
   | `#optimization-guide-on-device-model` | **Enabled BypassPerfRequirement** |
   | `#prompt-api-for-gemini-nano` | **Enabled** |

3. **Restart Chrome** - Click the "Relaunch" button

4. **Download the Model** - Navigate to `chrome://components`, find "Optimization Guide On Device Model", and click "Check for update"

5. **Verify** - Open DevTools Console (`F12`) and run:
   ```javascript
   await LanguageModel.availability()
   // Should return: "readily" or "available"
   ```

> 💡 **Note**: The model is ~1.5-2GB and downloads automatically on first use. First AI call may be slow.

### Without Chrome AI

BTMS works without Chrome AI! When AI is unavailable, it automatically falls back to a **rule-based naming system** that:
- Analyzes domains (e.g., "github", "stackoverflow")
- Identifies topics (development, shopping, research)
- Generates sensible session names from tab patterns

You'll still get intelligent session names – just without the Gemini Nano magic.

See `docs/guides/chrome-ai-setup-linux.md` for detailed platform-specific instructions.


## 📋 Documentation

- [Implementation Plan](docs/planning/implementation-plan.md) - All 11 EPICs and tasks
- [Chrome AI Setup](docs/guides/chrome-ai-setup-linux.md) - Enable Chrome Built-in AI
- [Chrome AI Usage](docs/guides/chrome-ai-usage.md) - API patterns and examples
- [Tab Session Manager Analysis](docs/research/01-tab-session-manager-analysis.md) - Inspiration
- [AI Opportunities](docs/research/02-ai-opportunities.md) - AI feature ideas
- [Project Vision](docs/research/03-project-vision.md) - Technical decisions

## 🤖 For AI Assistants

See [AGENTS.md](AGENTS.md) for comprehensive context including:
- Architecture decisions
- Code patterns
- Chrome AI API usage
- Common pitfalls

## 📊 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 127+ | ✅ Full support (with AI) |
| Chrome < 127 | ✅ Works (AI fallback) |
| Edge | ✅ Works (AI fallback) |
| Brave | ✅ Works (AI fallback) |
| Arc | ✅ Works (AI fallback) |
| Firefox | ❌ Not supported |

## 📝 License

MIT - Personal project

---

*Built with curiosity and AI ☕🤖*
