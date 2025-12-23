# Tab Session Manager - Deep Dive Analysis

> Research completed: 2025-12-22
> Source: https://github.com/sienori/Tab-Session-Manager

## Overview

Tab Session Manager is a popular WebExtension for saving and restoring the state of browser windows and tabs. It supports Chrome, Firefox, and Edge, and has been actively developed since ~2017.

### Key Stats
- **Firefox Rating**: 4.2 ⭐ (1,192 reviews)
- **Chrome Rating**: 3.5 ⭐ (5,400 ratings)
- **Contributors**: 22
- **Releases**: 72
- **Current Version**: 7.1.1 (released March 2025)
- **Tech Stack**: JavaScript, WebExtensions API, Manifest V3

---

## Core Features

### 1. Session Management
| Feature | Description |
|---------|-------------|
| **Save Sessions** | Manually save current window/tab state with custom name |
| **Restore Sessions** | Open saved sessions in new or existing windows |
| **Session Naming** | Custom naming for sessions |
| **Session Tags** | Organize sessions with tags |
| **Session Search** | Search sessions by name and tab name |

### 2. Auto-Save Capabilities
| Feature | Description |
|---------|-------------|
| **Window Close Autosave** | Automatically save when window is closed |
| **Interval Autosave** | Save at regular intervals (min 0.5 minutes) |
| **Startup Save** | Save session on browser startup |
| **Tracking Sessions** | Automatically track changes to a session |

### 3. Import/Export
| Feature | Description |
|---------|-------------|
| **JSON Export** | Export sessions to JSON files |
| **JSON Import** | Import sessions from JSON |
| **Session Buddy Import** | Import from Session Buddy format |
| **Firefox Session Store Import** | Import Firefox backup files |
| **Settings Import/Export** | Backup and restore extension settings |

### 4. Cloud Sync
| Feature | Description |
|---------|-------------|
| **Google Drive Sync** | Sync sessions via Google Drive |
| **Multi-device Sync** | Access sessions across devices |
| **Auto-sync Option** | Automatically sync changes |
| **Device Naming** | Add device name to saved sessions |

### 5. Tab Groups Support
| Feature | Description |
|---------|-------------|
| **Chrome Tab Groups** | Requires additional extension for saving |
| **Firefox Tab Groups** | Partial support (currently buggy) |

### 6. Advanced Features
| Feature | Description |
|---------|-------------|
| **Workspace Switching** | Switch between saved workspaces |
| **Lazy Loading** | Load tabs only when accessed (save memory) |
| **Favicon Compression** | Reduce session size by compressing favicons |
| **Local Backup** | Incremental backup to local storage |
| **Undo/Redo** | Undo accidental operations like deletion |
| **Dark Mode** | Follows OS dark mode setting |
| **Window Position** | Restore window positions (Firefox) |

---

## Technical Architecture

### Technologies
- **Language**: JavaScript/TypeScript
- **Extension API**: WebExtensions (Manifest V3)
- **Storage**: IndexedDB for sessions, browser.storage for settings
- **Cloud**: Google Drive API for cloud sync
- **Build**: npm-based build system
- **Node Version**: 18.19.1

### Key Components
```
src/
├── popup/          # Extension popup UI
├── background/     # Background service worker
├── settings/       # Settings page
├── icons/          # Extension icons
├── options/        # Options page
└── credentials.js  # API credentials (not tracked)
```

### Browser Support
- ✅ Chrome (via Chrome Web Store)
- ✅ Firefox (Mozilla Add-ons)
- ✅ Microsoft Edge (Edge Add-ons)

---

## Known Issues & Pain Points

### Critical Issues (from GitHub Issues & Reviews)
1. **Tab Groups Not Saving** - Firefox new tab groups not being saved (#1551)
2. **Export/Import Failures** - JSON exports fail to import (#1552)
3. **Tree Style Tab Integration** - Tabs not restored properly with TST (#1548)
4. **Large Session Performance** - Unable to view/handle sessions with many tabs (#1544)
5. **Session Loss** - Users reporting lost sessions and broken autosave (#1546)
6. **Restore Failures** - Sessions only partially restoring (#1540, #1545)
7. **Development Concerns** - Users questioning if project is abandoned (#1553)

### User Feedback Themes

#### Negative Patterns
- "Tab groups not preserved during restore"
- "Can't handle 500+ tabs reliably"
- "Delete button too close to open button"
- "Sessions duplicating on restore"
- "Import functionality unreliable"
- "Tree structure gets flattened"

#### Positive Patterns
- "Saved me when Firefox lost 500+ tabs"
- "Auto-save is a lifesaver"
- "Window position restore is great"
- "Has saved me many times from data loss"
- "5000+ tabs recovered from saved file"

---

## Market & Alternatives

### Competing Extensions
1. **Session Buddy** (Chrome) - Popular but Chrome-only
2. **OneTab** - Converts tabs to a list (different model)
3. **Toby** - Visual tab manager with collections
4. **Workona** - Workspace management
5. **Tab Stash** (Firefox) - Bookmark-based approach

### Differentiators
- Cross-browser support
- Auto-save capabilities
- Cloud sync via Google Drive
- Open source
- Tracking sessions for workspaces

---

## Session Data Structure (Inferred)

```javascript
{
  id: "uuid",
  name: "Session Name",
  date: 1703241388000,
  tag: ["work", "research"],
  windows: [
    {
      id: 1,
      incognito: false,
      position: { left: 0, top: 0, width: 1920, height: 1080 },
      tabs: [
        {
          id: 1,
          url: "https://example.com",
          title: "Example",
          favicon: "data:image/...",
          pinned: false,
          active: true,
          index: 0,
          // Tab group info (Chrome)
          groupId: -1
        }
      ]
    }
  ],
  windowsNumber: 1,
  tabsNumber: 10,
  device: "home-laptop"
}
```

---

## What's Missing?

### Feature Gaps
1. No AI-powered features
2. No smart session naming/categorization
3. No session analytics or insights
4. Limited search (basic text matching)
5. No session comparison or diff
6. No duplicate tab detection
7. No session templates
8. No session sharing between users
9. No natural language commands
10. No smart workspace suggestions

### UX Gaps
1. Popup interface is dense/cluttered
2. No visual preview of sessions
3. Limited keyboard navigation
4. No drag-and-drop organization
5. Poor error messaging
6. No onboarding experience
7. No contextual help
