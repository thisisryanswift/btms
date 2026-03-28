---
id: btms-2q9
status: closed
deps: []
links: []
created: 2025-12-23T12:49:40.049415388-05:00
type: task
priority: 3
---
# Language selection does not update UI

In the Settings page, changing the language dropdown does not update the UI language.

**Steps to reproduce:**
1. Open BTMS Settings page
2. Change language from English to Spanish/French/German
3. Observe no language change in the UI

**Expected:** UI text should change to selected language
**Actual:** No change occurs

---

## Implementation Details

**File:** `dev/src/components/OptionsApp.tsx`

**Location:** Language dropdown in `renderGeneralSettings`, lines 74-91

**Root cause:** No internationalization (i18n) system is implemented. The dropdown saves the preference but there's no translation infrastructure.

**Options to fix:**

### Option 1: Remove feature (simplest)
Remove the language dropdown since i18n is not implemented:
```typescript
{/* Language selector removed - i18n not yet implemented */}
```

### Option 2: Implement i18n (complex)
1. Install i18n library: `npm install react-i18next i18next`
2. Create translation files in `src/locales/`
3. Wrap app in i18n provider
4. Replace all hardcoded strings with `t('key')` calls

**Recommendation:** For now, remove the dropdown or add a 'Coming soon' indicator. Full i18n is a significant undertaking.

**Quick fix example:**
```typescript
<div className="flex items-center justify-between">
  <div>
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">More languages coming soon</p>
  </div>
  <span className="text-sm text-gray-500">English</span>
</div>
```


