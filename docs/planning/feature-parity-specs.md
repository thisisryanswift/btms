# BTMS Feature Parity - Detailed Specs

> For handoff to implementation agent
> Created: 2025-12-23

---

## EPIC-12: Session Search

### Overview
Add client-side search functionality to filter saved sessions by name, tags, and tab content.

### User Story
As a user with many saved sessions, I want to quickly find a specific session by typing keywords so I don't have to scroll through a long list.

### Acceptance Criteria
- [ ] Search input appears in sidepanel above session list
- [ ] Filtering happens in real-time as user types (debounced 300ms)
- [ ] Matches session name (case-insensitive)
- [ ] Matches session tags (case-insensitive)
- [ ] Matches tab titles within session (case-insensitive)
- [ ] Shows "No results" message when no matches
- [ ] Clear button (X) to reset search
- [ ] Search persists during session (clears on close)

### Technical Spec

#### Files to Modify
- `src/components/Popup.tsx` - Add SearchBar component
- `src/hooks/useSession.ts` - Add filtering logic

#### Files to Create
- `src/components/SearchBar.tsx` - Search input component

#### Implementation Details

**SearchBar.tsx:**
```
Props:
- value: string
- onChange: (value: string) => void
- placeholder?: string (default: "Search sessions...")

Features:
- Input with search icon on left
- Clear (X) button on right when value exists
- Tailwind styling matching existing dark theme
- Focus ring on input
```

**Filtering Logic (in useSession.ts or new useFilteredSessions hook):**
```
function filterSessions(sessions: Session[], query: string): Session[] {
  if (!query.trim()) return sessions;
  
  const lowerQuery = query.toLowerCase();
  
  return sessions.filter(session => {
    // Match session name
    if (session.name.toLowerCase().includes(lowerQuery)) return true;
    
    // Match tags
    if (session.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
    
    // Match tab titles
    const allTabs = session.windows.flatMap(w => w.tabs);
    if (allTabs.some(tab => tab.title?.toLowerCase().includes(lowerQuery))) return true;
    
    return false;
  });
}
```

**State Management:**
- Use React useState in Popup.tsx for search query
- Pass filtered sessions to SessionList component
- No persistence needed (search clears on sidepanel close)

### Tasks

#### 12.1 Create SearchBar component
- Create `src/components/SearchBar.tsx`
- Props: value, onChange, placeholder
- Render: input with magnifying glass icon, X clear button
- Style: match existing dark theme (bg-gray-800, border-gray-700, etc.)
- Width: full width of container
- Height: ~40px

#### 12.2 Add search state to Popup
- Add `const [searchQuery, setSearchQuery] = useState('')` to Popup.tsx
- Render SearchBar above session list section
- Wire up onChange to setSearchQuery

#### 12.3 Implement filtering logic
- Create filterSessions function (can be in Popup.tsx or separate util)
- Filter by: session.name, session.tags, tab titles
- Case-insensitive matching
- Pass filtered sessions to SessionList instead of raw sessions

#### 12.4 Add debounce for performance
- Use 300ms debounce on filter execution
- Can use simple setTimeout/clearTimeout pattern
- Or install `use-debounce` package

#### 12.5 Handle empty state
- When search has no results, show friendly message
- "No sessions found for '[query]'"
- Include clear button in message

---

## EPIC-13: Lazy Tab Loading

### Overview
When restoring a session, load tabs in "lazy" mode where they don't actually load until the user clicks on them. Saves memory and bandwidth.

### User Story
As a user restoring a session with 50+ tabs, I want tabs to only load when I click them so my browser doesn't become slow and unresponsive.

### Acceptance Criteria
- [ ] New "Lazy load tabs" toggle in Settings > General
- [ ] Default: enabled (lazy loading on)
- [ ] When enabled, restored tabs show title/favicon but don't load until clicked
- [ ] When disabled, tabs load immediately (current behavior)
- [ ] Pinned tabs always load immediately regardless of setting
- [ ] Active tab in each window loads immediately

### Technical Spec

#### Chrome API
Chrome's `chrome.tabs.create()` supports a `url` parameter. For lazy loading:
- Create tab with `url: "about:blank"` initially
- Store real URL in tab's session storage or use Tab Discard extension pattern

**Better approach - use `discarded` property:**
```javascript
chrome.tabs.create({
  url: realUrl,
  active: false,
  discarded: true,  // Key! Tab shows title/favicon but doesn't load
  title: savedTitle
});
```

Note: `discarded: true` requires the tab to also have `active: false`.

#### Files to Modify
- `src/types/settings.ts` - Add lazyLoading to settings
- `src/hooks/useSessionMutations.ts` - Modify restore logic
- `src/components/OptionsApp.tsx` - Add toggle in General section

#### Settings Change
Add to `BTMSSettings.general`:
```typescript
general: {
  // ... existing
  lazyLoadTabs: boolean; // default: true
}
```

Add to DEFAULT_SETTINGS:
```typescript
general: {
  lazyLoadTabs: true,
}
```

#### Restore Logic Change
In `useSessionMutations.ts`, modify `useRestoreSession`:

```typescript
// When creating tabs:
for (const tab of window.tabs) {
  const isActiveTab = tab.active;
  const isPinned = tab.pinned;
  const shouldLazyLoad = settings.general.lazyLoadTabs && !isActiveTab && !isPinned;
  
  await chrome.tabs.create({
    windowId: newWindow.id,
    url: tab.url,
    active: isActiveTab,
    pinned: isPinned,
    discarded: shouldLazyLoad,  // Lazy load if setting enabled
  });
}
```

### Tasks

#### 13.1 Add lazyLoadTabs setting
- Add `lazyLoadTabs: boolean` to `settings.ts` under `general` or new `restore` section
- Default value: `true`
- Update DEFAULT_SETTINGS

#### 13.2 Add Settings UI toggle
- Add toggle in OptionsApp.tsx General section
- Label: "Lazy load tabs"
- Description: "Only load tabs when clicked (saves memory)"
- Wire to settings.general.lazyLoadTabs

#### 13.3 Modify tab restore logic
- In useSessionMutations.ts useRestoreSession hook
- Read lazyLoadTabs setting
- When creating tabs, set `discarded: true` for non-active, non-pinned tabs
- Active tab and pinned tabs always load immediately

#### 13.4 Test with large session
- Create test session with 20+ tabs
- Restore with lazy loading ON - verify tabs don't load
- Restore with lazy loading OFF - verify tabs load immediately
- Verify clicking a discarded tab loads it

---

## EPIC-14: Startup Autosave

### Overview
Automatically save the current browser state when Chrome starts up, capturing what the user had open from their previous session.

### User Story
As a user, I want BTMS to automatically capture my tabs when Chrome starts so I have a backup of what I was working on.

### Acceptance Criteria
- [ ] New "Save on startup" toggle in Settings > Auto-Save
- [ ] Default: disabled (opt-in feature)
- [ ] When enabled, saves session within 5 seconds of extension loading
- [ ] Startup saves tagged with "startup" tag
- [ ] Respects maxSessions limit (counts toward auto-save limit)
- [ ] Doesn't save if browser has no tabs (new window only)
- [ ] Doesn't save if only new tab page is open

### Technical Spec

#### Background Script Change
In `entrypoints/background.ts`, add startup detection:

```typescript
// In BTMSBackground class initialize() method:
async initialize() {
  // ... existing code ...
  
  // Check for startup save
  if (this.settings?.autoSave?.saveOnStartup) {
    await this.performStartupSave();
  }
}

async performStartupSave() {
  // Wait a few seconds for browser to fully load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check if there are meaningful tabs to save
  const windows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
  const allTabs = windows.flatMap(w => w.tabs || []);
  const meaningfulTabs = allTabs.filter(tab => 
    tab.url && 
    !tab.url.startsWith('chrome://newtab') &&
    !tab.url.startsWith('chrome://extensions')
  );
  
  if (meaningfulTabs.length === 0) {
    console.log('⏭️ Startup save skipped - no meaningful tabs');
    return;
  }
  
  console.log('🚀 Performing startup save...');
  await this.performAutoSave('startup');
}
```

#### Settings Change
Add to `BTMSSettings.autoSave`:
```typescript
autoSave: {
  // ... existing
  saveOnStartup: boolean; // default: false
}
```

#### Tag the startup save
Modify performAutoSave to accept trigger type and tag accordingly:
```typescript
tags: trigger === 'startup' ? ['startup', 'auto-save'] : ['auto-save'],
```

### Tasks

#### 14.1 Add saveOnStartup setting
- Add `saveOnStartup: boolean` to settings.ts autoSave section
- Default: `false` (opt-in)
- Update DEFAULT_SETTINGS

#### 14.2 Add Settings UI toggle
- Add toggle in OptionsApp.tsx Auto-Save section
- Label: "Save on browser startup"
- Description: "Capture tabs when Chrome opens"
- Wire to settings.autoSave.saveOnStartup

#### 14.3 Implement startup detection in background
- In background.ts initialize(), check saveOnStartup setting
- If enabled, wait 3 seconds then call performAutoSave('startup')
- Add 'startup' to tags for startup saves

#### 14.4 Filter out empty/new-tab-only saves
- Before saving, check if there are meaningful tabs
- Skip if only chrome://newtab or chrome://extensions
- Skip if no tabs at all
- Log skip reason to console

#### 14.5 Test startup save
- Enable setting, restart extension
- Verify save appears with "startup" tag
- Verify it respects maxSessions limit
- Verify empty browser doesn't create save

---

## Summary

| Epic | Priority | Difficulty | Est. Time |
|------|----------|------------|-----------|
| EPIC-12: Session Search | High | Easy | 2-3 hours |
| EPIC-13: Lazy Tab Loading | High | Medium | 2-3 hours |
| EPIC-14: Startup Autosave | Medium | Easy | 1-2 hours |

### Recommended Order
1. Session Search (most user-visible improvement)
2. Startup Autosave (quick win)
3. Lazy Tab Loading (more complex, needs testing)
