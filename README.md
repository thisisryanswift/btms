# BTMS - Better Tab & Session Manager

> 🧠 An AI-first Chrome extension for intelligent browser session management

## 🎉 Project Status

**✅ Feature Complete!** All 11 EPICs completed.

BTMS is a modern, AI-powered browser extension that makes managing browser sessions invisible, intelligent, and delightful.

## ✨ Features

### Core Session Management
- **Save Sessions** - Capture all open tabs with one click
- **Restore Sessions** - Reopen entire sessions in new windows
- **View Sessions** - Browse saved sessions with expandable details
- **Delete Sessions** - Remove sessions with confirmation

### AI-Powered Features
- **Smart Naming** - AI generates meaningful session names based on tab content
- **Chrome Built-in AI** - Uses local Gemini Nano (no API keys, free, private)
- **Rule-based Fallback** - Works even when AI isn't available

### Additional Features
- **Auto-save** - Automatic periodic saves with configurable intervals
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

Output will be in `dev/.output/chrome-mv3/`

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
btms/
├── dev/                       # WXT source directory
│   ├── entrypoints/          # Extension entry points
│   │   ├── popup/            # Main popup UI
│   │   ├── options/          # Settings page
│   │   ├── sidepanel/        # Side panel (placeholder)
│   │   └── background.ts     # Service worker for auto-save
│   └── src/
│       ├── components/       # React components
│       │   ├── Popup.tsx
│       │   ├── SessionList.tsx
│       │   └── OptionsApp.tsx
│       ├── hooks/            # TanStack Query hooks
│       ├── lib/              # Shared utilities
│       │   ├── constants.ts  # Storage keys, query keys
│       │   ├── download.ts   # File download utility
│       │   ├── storage.ts    # Session storage operations
│       │   └── uuid.ts       # ID generation
│       ├── services/         # AI, Import/Export, Settings
│       ├── types/            # TypeScript types
│       └── test/             # Test setup and mocks
├── docs/                     # Documentation
│   ├── guides/              # Setup guides
│   ├── planning/            # Implementation plan
│   └── research/            # Feature research
├── wxt.config.ts            # WXT configuration
├── vitest.config.ts         # Test configuration
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

BTMS uses Chrome's experimental Built-in AI feature for on-device AI processing. 

### Setup (Linux/Chrome 127+)

1. Enable flags at `chrome://flags`:
   - `#optimization-guide-on-device-model` → Enabled BypassPerfRequirement
   - `#prompt-api-for-gemini-nano` → Enabled

2. Restart Chrome

3. Model downloads automatically on first use (~1.5GB)

See `docs/guides/chrome-ai-setup-linux.md` for detailed instructions.

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
