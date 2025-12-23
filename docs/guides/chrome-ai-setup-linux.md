# Enabling Chrome Built-in AI (Gemini Nano) on Fedora Linux

> ✅ **VERIFIED WORKING** - Tested on Fedora 43 with Chrome 143 on 2025-12-22
> 
> Guide for setting up Chrome's on-device AI features on Fedora Linux

---

## ✅ Confirmed: Linux is Fully Supported!

Chrome's Built-in AI with Gemini Nano works on Linux. We've tested and confirmed this on:
- **OS**: Fedora 43
- **Chrome**: 143.0.7499.169 (Stable)
- **Performance Class**: High (detected automatically)

---

## 📋 Requirements

| Requirement | Minimum | Notes |
|-------------|---------|-------|
| **OS** | Linux (Fedora, Ubuntu, etc.) | Fully supported |
| **Chrome Version** | 140+ Stable | Or 127+ Dev/Canary |
| **Storage** | 22 GB free | Model is ~1.5-2GB but needs buffer |
| **Hardware** | 16GB RAM, 4+ cores | GPU optional but faster |

---

## 🚀 Step-by-Step Setup

### Step 1: Install Chrome Dev or Canary

For the latest AI features, Chrome Dev or Canary is recommended:

**Option A: Chrome Dev (Recommended)**
```bash
# Download Chrome Dev for Linux
# Go to: https://www.google.com/chrome/dev/
# Or use the direct RPM link for Fedora:
wget https://dl.google.com/linux/direct/google-chrome-unstable_current_x86_64.rpm
sudo dnf install ./google-chrome-unstable_current_x86_64.rpm
```

**Option B: Check your current Chrome version**
```bash
google-chrome --version
# or
google-chrome-stable --version
```

If you're on Chrome 140+, you may be able to use stable. Otherwise, Dev/Canary is needed.

---

### Step 2: Enable Chrome Flags

1. Open Chrome and navigate to:
   ```
   chrome://flags
   ```

2. **Enable these two flags:**

   | Flag | Setting |
   |------|---------|
   | `#prompt-api-for-gemini-nano` | **Enabled** (or "Enabled multilingual") |
   | `#optimization-guide-on-device-model` | **Enabled BypassPerfRequirement** |

   > 💡 The "BypassPerfRequirement" option allows it to work even if your hardware doesn't meet the recommended specs.

3. **Click "Relaunch"** at the bottom of the page

---

### Step 3: Download the Gemini Nano Model

1. Navigate to:
   ```
   chrome://components
   ```

2. Find **"Optimization Guide On Device Model"**

3. Click **"Check for update"**

4. Wait for the download to complete (may take a few minutes, ~2GB model)

   > The version should show something like `2024.x.x.x` when ready

---

### Step 4: Verify It's Working

1. Open Chrome DevTools:
   - Press `Shift + Ctrl + J` (or `F12` → Console tab)

2. Run this test command:
   ```javascript
   // Check if the API is available
   await ai.languageModel.capabilities()
   ```

3. **Expected output:**
   ```javascript
   {available: 'readily', defaultTopK: 3, maxTopK: 8, defaultTemperature: 1}
   ```

   If you see `available: 'readily'` → **Success! 🎉**

4. Try a quick prompt:
   ```javascript
   const session = await ai.languageModel.create();
   await session.prompt("What is 2 + 2?");
   ```

---

## 🔧 Troubleshooting

### Issue: "available: 'no'" or API not found

1. **Check Chrome version** - Need 127+ (Dev/Canary) or 140+ (Stable)
2. **Verify flags are enabled** - Go back to `chrome://flags` and confirm
3. **Check model downloaded** - In `chrome://components`, ensure model version is shown
4. **Restart Chrome completely** - Close all windows, then reopen

### Issue: Model not downloading

1. Check disk space: `df -h ~` (need 22GB free)
2. Check Chrome profile storage: `du -sh ~/.config/google-chrome*`
3. Try clicking "Check for update" again in `chrome://components`

### Issue: Slow performance

1. If you have a discrete GPU, Chrome should use it automatically
2. Check GPU is being used: `chrome://gpu`
3. CPU inference is slower but works - be patient on first run

---

## 🧪 Quick Test Script

Save this as a bookmark or run in console to test the full API:

```javascript
(async () => {
  console.log("🔍 Checking Chrome AI availability...\n");
  
  // Check if API exists
  if (!('ai' in self)) {
    console.error("❌ AI API not found. Enable flags and restart Chrome.");
    return;
  }
  
  // Check capabilities
  const caps = await ai.languageModel.capabilities();
  console.log("📊 Capabilities:", caps);
  
  if (caps.available !== 'readily') {
    console.error("❌ Model not ready. Check chrome://components");
    return;
  }
  
  console.log("✅ AI is ready! Testing a prompt...\n");
  
  // Test prompt
  const session = await ai.languageModel.create();
  const response = await session.prompt(
    "Generate a creative 3-word name for a browser tab manager extension"
  );
  
  console.log("🤖 AI Response:", response);
  console.log("\n🎉 Chrome Built-in AI is working!");
})();
```

---

## 📚 Available APIs

Once enabled, you have access to these APIs:

| API | Use Case | Status |
|-----|----------|--------|
| `ai.languageModel` | General prompts, chat | ✅ Available |
| `ai.summarizer` | Text summarization | ✅ Available |
| `ai.writer` | Content generation | ✅ Available |
| `ai.rewriter` | Content rewriting | ✅ Available |
| `ai.translator` | Language translation | ✅ Available |
| `ai.languageDetector` | Detect language | ✅ Available |

---

## 🔗 Resources

- [Chrome AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Prompt API Guide](https://developer.chrome.com/docs/ai/built-in-apis)
- [Chrome for Developers Blog](https://developer.chrome.com/blog)

---

## Next Steps for BTMS

With Chrome AI enabled, we can:

1. **Use `ai.languageModel`** for session naming
2. **Use `ai.summarizer`** for session summaries  
3. **Use `ai.languageDetector`** to categorize tabs by language
4. Build with **graceful fallback** to cloud APIs when not available

```typescript
// Example: Smart fallback pattern
async function generateSessionName(tabs: Tab[]): Promise<string> {
  const tabTitles = tabs.map(t => t.title).join(', ');
  
  // Try Chrome Built-in AI first (free, private, fast)
  if ('ai' in self && 'languageModel' in self.ai) {
    try {
      const caps = await self.ai.languageModel.capabilities();
      if (caps.available === 'readily') {
        const session = await self.ai.languageModel.create();
        return await session.prompt(
          `Generate a short, descriptive 2-4 word name for a browser session containing these tabs: ${tabTitles}`
        );
      }
    } catch (e) {
      console.warn('Chrome AI failed, falling back...', e);
    }
  }
  
  // Fallback to Ollama or Cloud API
  return await cloudAPI.generateName(tabTitles);
}
```
