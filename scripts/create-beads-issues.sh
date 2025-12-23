#!/bin/bash
# BTMS - Create Beads Issues from Implementation Plan
# Run this script to set up all epics and tasks

set -e

echo "🚀 Creating BTMS Beads Issues..."
echo ""

# ============================================
# PHASE 1: FOUNDATION
# ============================================

echo "📦 Phase 1: Foundation"
echo ""

# EPIC-1: Project Setup
echo "Creating EPIC-1: Project Setup..."
bd create "EPIC: Project Setup - Initialize extension with WXT, TypeScript, and core dependencies" -p 0

echo "Creating EPIC-1 tasks..."
bd create "1.1 Initialize WXT project with TypeScript" -p 1
bd create "1.2 Configure Manifest V3 with required permissions" -p 1
bd create "1.3 Install core dependencies (React, Tailwind, TanStack, Zustand)" -p 1
bd create "1.4 Configure Tailwind CSS with dark mode" -p 1
bd create "1.5 Create extension entry points (popup, background, options, sidepanel)" -p 1
bd create "1.6 Create project folder structure (components, hooks, services, types, stores)" -p 1

# EPIC-2: Storage Layer
echo "Creating EPIC-2: Storage Layer..."
bd create "EPIC: Storage Layer - IndexedDB session storage with CRUD operations" -p 0

echo "Creating EPIC-2 tasks..."
bd create "2.1 Define TypeScript types for Session, SessionWindow, SessionTab" -p 1
bd create "2.2 Create IndexedDB database schema with indexes" -p 1
bd create "2.3 Create database connection utility with singleton pattern" -p 1
bd create "2.4 Implement session CREATE operation" -p 1
bd create "2.5 Implement session READ operations (get, getAll, getByTag)" -p 1
bd create "2.6 Implement session UPDATE operation" -p 1
bd create "2.7 Implement session DELETE operations (single, bulk, all)" -p 1
bd create "2.8 Create unified StorageService class" -p 1
bd create "2.9 Create TanStack Query hooks for storage (useSession, useSessions, mutations)" -p 1

# EPIC-3: Core Session Logic
echo "Creating EPIC-3: Core Session Logic..."
bd create "EPIC: Core Session Logic - Chrome tabs API integration for save/restore" -p 0

echo "Creating EPIC-3 tasks..."
bd create "3.1 Create tab capture utility using chrome.tabs.query" -p 1
bd create "3.2 Create window capture utility with tab groups" -p 1
bd create "3.3 Create session snapshot function combining windows and tabs" -p 1
bd create "3.4 Create tab restore utility with pinned and group support" -p 1
bd create "3.5 Create window restore utility with state handling" -p 1
bd create "3.6 Create full session restore function with options" -p 1
bd create "3.7 Create unified SessionService class" -p 1
bd create "3.8 Create UUID generation utility" -p 1
bd create "3.9 Create date/time formatting utilities" -p 1

# ============================================
# PHASE 2: AI INTEGRATION
# ============================================

echo ""
echo "🤖 Phase 2: AI Integration"
echo ""

# EPIC-4: Chrome AI Service
echo "Creating EPIC-4: Chrome AI Service..."
bd create "EPIC: Chrome AI Service - Gemini Nano integration with fallback" -p 0

echo "Creating EPIC-4 tasks..."
bd create "4.1 Create TypeScript types for Chrome Built-in AI (LanguageModel)" -p 1
bd create "4.2 Create Chrome AI availability check function" -p 1
bd create "4.3 Create Chrome AI session manager with caching" -p 1
bd create "4.4 Create AI prompt builder utilities" -p 1
bd create "4.5 Create fallback AI provider (heuristic-based)" -p 1
bd create "4.6 Create unified AIService class with automatic fallback" -p 1
bd create "4.7 Create useAI and useAIStatus React hooks" -p 1

# EPIC-5: AI Features
echo "Creating EPIC-5: AI Features..."
bd create "EPIC: AI Features - Session naming, summaries, and tag suggestions" -p 0

echo "Creating EPIC-5 tasks..."
bd create "5.1 Implement AI session name generation (2-4 words)" -p 1
bd create "5.2 Implement AI session summary generation (max 15 words)" -p 1
bd create "5.3 Implement AI tag suggestion (3-5 tags)" -p 1
bd create "5.4 Integrate AI into session save workflow" -p 1

# ============================================
# PHASE 3: UI/UX
# ============================================

echo ""
echo "🎨 Phase 3: UI/UX"
echo ""

# EPIC-6: Popup UI
echo "Creating EPIC-6: Popup UI..."
bd create "EPIC: Popup UI - Main extension popup with layout and core components" -p 0

echo "Creating EPIC-6 tasks..."
bd create "6.1 Create PopupLayout component (400x500px, header/content/footer)" -p 1
bd create "6.2 Create Header component with logo and action buttons" -p 1
bd create "6.3 Create SaveButton component with loading state" -p 1
bd create "6.4 Create EmptyState component for no sessions" -p 1
bd create "6.5 Create Loading and Skeleton components" -p 1
bd create "6.6 Wire up popup entry point with all providers" -p 1

# EPIC-7: Session List Component
echo "Creating EPIC-7: Session List Component..."
bd create "EPIC: Session List - TanStack Table with search, filter, and actions" -p 0

echo "Creating EPIC-7 tasks..."
bd create "7.1 Create SessionCard component (name, summary, badges, actions)" -p 1
bd create "7.2 Create SessionActions dropdown menu" -p 1
bd create "7.3 Create SessionList with TanStack Table and Virtual" -p 1
bd create "7.4 Create SearchBar and FilterControls components" -p 1
bd create "7.5 Implement client-side search with debounce" -p 1
bd create "7.6 Create ConfirmDialog for delete confirmation" -p 1
bd create "7.7 Create SessionEditModal for editing session details" -p 1

# EPIC-8: Settings Page
echo "Creating EPIC-8: Settings Page..."
bd create "EPIC: Settings Page - Options UI for user preferences" -p 0

echo "Creating EPIC-8 tasks..."
bd create "8.1 Create SettingsLayout component" -p 1
bd create "8.2 Create settingsStore with chrome.storage.sync persistence" -p 1
bd create "8.3 Create GeneralSettings section (theme, version)" -p 1
bd create "8.4 Create AutoSaveSettings section (toggle, interval)" -p 1
bd create "8.5 Create AISettings section (enable/disable, status)" -p 1
bd create "8.6 Create ExcludeURLs section for URL patterns" -p 1
bd create "8.7 Wire up options entry point" -p 1

# ============================================
# PHASE 4: POLISH
# ============================================

echo ""
echo "✨ Phase 4: Polish"
echo ""

# EPIC-9: Auto-save & Background
echo "Creating EPIC-9: Auto-save & Background..."
bd create "EPIC: Auto-save & Background - Service worker with periodic saves" -p 0

echo "Creating EPIC-9 tasks..."
bd create "9.1 Set up background service worker initialization" -p 1
bd create "9.2 Implement window close detection for auto-save" -p 1
bd create "9.3 Implement interval auto-save with chrome.alarms" -p 1
bd create "9.4 Create auto-save cleanup (limit old auto-saves)" -p 1

# EPIC-10: Import/Export
echo "Creating EPIC-10: Import/Export..."
bd create "EPIC: Import/Export - Session backup and restore as JSON" -p 0

echo "Creating EPIC-10 tasks..."
bd create "10.1 Implement session export to JSON file" -p 1
bd create "10.2 Implement session import with validation" -p 1
bd create "10.3 Create ImportExport settings UI" -p 1
bd create "10.4 Add export option to session actions menu" -p 1

# EPIC-11: Testing & Quality
echo "Creating EPIC-11: Testing & Quality..."
bd create "EPIC: Testing & Quality - Test coverage and final polish" -p 0

echo "Creating EPIC-11 tasks..."
bd create "11.1 Set up Vitest testing framework" -p 1
bd create "11.2 Write StorageService unit tests" -p 1
bd create "11.3 Write SessionService unit tests" -p 1
bd create "11.4 Write AIService unit tests" -p 1
bd create "11.5 Create manual testing checklist" -p 1
bd create "11.6 Performance optimization for large session lists" -p 1
bd create "11.7 Accessibility audit (keyboard nav, ARIA, contrast)" -p 1
bd create "11.8 Final UI/UX polish" -p 1

echo ""
echo "✅ All issues created!"
echo ""
echo "Summary:"
echo "  - 11 Epics"
echo "  - 61 Tasks"
echo ""
echo "Run 'bd list' to see all issues"
echo "Run 'bd ready' to see tasks ready to work on"
