# Chrome Built-in AI - Usage Guide for BTMS

> ✅ **VERIFIED WORKING** - Tested on Fedora 43 with Chrome 143
> 
> Code examples and patterns for using Chrome's on-device AI in BTMS

---

## 🔑 Key Findings

### API Access Pattern

**Important**: Use the global `LanguageModel` object, NOT `ai.languageModel`:

```javascript
// ❌ WRONG - This doesn't work
await ai.languageModel.create();

// ✅ CORRECT - Use the LanguageModel global
await LanguageModel.create({
  expectedInputLanguages: ['en'],
  expectedOutputLanguages: ['en']
});
```

### Language Specification Required

You MUST specify input/output languages or you'll get a warning:

```javascript
const session = await LanguageModel.create({
  expectedInputLanguages: ['en'],   // Required!
  expectedOutputLanguages: ['en']   // Required!
});
```

Supported languages: `en`, `es`, `ja`

---

## 📊 Session Properties

When you create a session, you get:

```javascript
LanguageModel {
  inputUsage: 0,        // Tokens used so far
  inputQuota: 9216,     // Max tokens available (~9k context)
  topK: 3,              // Top-k sampling parameter
  temperature: 1,       // Temperature for generation
  onquotaoverflow: null // Callback for quota exceeded
}
```

---

## 🧠 Model Specifications

### Gemini Nano Details

| Property | Value |
|----------|-------|
| **Model Name** | Gemini Nano |
| **Variants** | Nano-1 (1.8B params) / Nano-2 (3.25B params) |
| **Context Window** | ~9,216 tokens |
| **Execution** | WebAssembly/WebGPU (GPU, NPU, or CPU fallback) |
| **Model Size** | ~1.5-2GB download |
| **Best For** | Summarization, classification, rewriting, simple Q&A |
| **Not Ideal For** | Complex reasoning, precise factual queries, long-form generation |

---

## 🎛️ Tuning Parameters

### What You CAN Adjust

```javascript
const session = await LanguageModel.create({
  // Required
  expectedInputLanguages: ['en'],
  expectedOutputLanguages: ['en'],
  
  // Tunable parameters
  temperature: 0.7,  // 0.0 - 2.0 (default: 1.0)
  topK: 5,           // 1 - 8 (default: 3)
});
```

### Parameter Reference

| Parameter | Range | Default | Effect |
|-----------|-------|---------|--------|
| **temperature** | 0.0 - 2.0 | 1.0 | Higher = more creative/random, Lower = more deterministic |
| **topK** | 1 - 8 | 3 | Higher = considers more token options, more variety |

### Recommended Settings for BTMS

**Session Naming (consistent outputs preferred):**
```javascript
const session = await LanguageModel.create({
  expectedInputLanguages: ['en'],
  expectedOutputLanguages: ['en'],
  temperature: 0.3,  // Low = consistent
  topK: 2,           // Focused responses
});
```

**Summaries (some variety OK):**
```javascript
const session = await LanguageModel.create({
  expectedInputLanguages: ['en'],
  expectedOutputLanguages: ['en'],
  temperature: 0.7,
  topK: 4,
});
```

### What You CANNOT Do

| Limitation | Details |
|------------|---------|
| Change base model | Stuck with Gemini Nano Chrome provides |
| Fine-tune with data | Can't train on custom datasets |
| Increase context | Fixed at ~9k tokens |
| Add custom knowledge | No RAG/embeddings built-in |
| System prompts | No official support (embed in your prompt) |

### Workaround: Prompt Engineering

Since you can't fine-tune, use detailed prompts to "tune" behavior:

```javascript
const result = await session.prompt(`
You are a browser session naming assistant.
Rules:
- Generate names that are 2-4 words
- Use title case
- Be descriptive but concise
- Focus on the main topic, not specific sites

Tabs:
- GitHub - Tab Session Manager
- Stack Overflow - React hooks  
- MDN - Web APIs

Generate ONLY the session name, nothing else:
`);
```

---

## 🧪 Working Code Examples

### Basic Prompt

```javascript
const session = await LanguageModel.create({
  expectedInputLanguages: ['en'],
  expectedOutputLanguages: ['en']
});

const result = await session.prompt("What is 2 + 2?");
console.log(result); // "2 + 2 = 4"
```

### AI Session Naming (BTMS Use Case)

```javascript
async function generateSessionName(tabs) {
  const session = await LanguageModel.create({
    expectedInputLanguages: ['en'],
    expectedOutputLanguages: ['en']
  });
  
  const tabTitles = tabs.map(t => t.title).join(', ');
  
  const result = await session.prompt(
    `Generate a short 2-4 word name for a browser session containing these tabs. 
     Only respond with the name, nothing else.
     Tabs: ${tabTitles}`
  );
  
  return result.trim();
}

// Example usage:
const tabs = [
  { title: "GitHub - Tab Session Manager" },
  { title: "Stack Overflow - React hooks" },
  { title: "MDN - Web APIs" }
];
const name = await generateSessionName(tabs);
console.log(name); // e.g., "Web Development Research"
```

### Session Summarization

```javascript
async function summarizeSession(tabs) {
  const session = await LanguageModel.create({
    expectedInputLanguages: ['en'],
    expectedOutputLanguages: ['en']
  });
  
  const tabList = tabs.map(t => `- ${t.title}`).join('\n');
  
  const result = await session.prompt(
    `Summarize this browser session in one sentence (max 15 words):
     
     Tabs:
     ${tabList}`
  );
  
  return result.trim();
}
```

### With Fallback Pattern

```javascript
async function generateSessionNameWithFallback(tabs) {
  const tabTitles = tabs.map(t => t.title).join(', ');
  
  // Try Chrome Built-in AI first (free, private, fast)
  if (typeof LanguageModel !== 'undefined') {
    try {
      const availability = await LanguageModel.availability();
      
      if (availability === 'available' || availability === 'readily') {
        const session = await LanguageModel.create({
          expectedInputLanguages: ['en'],
          expectedOutputLanguages: ['en']
        });
        
        return await session.prompt(
          `Generate a short 2-4 word name for these tabs: ${tabTitles}`
        );
      }
    } catch (e) {
      console.warn('Chrome AI failed, falling back...', e);
    }
  }
  
  // Fallback to cloud API or simple heuristic
  return generateFallbackName(tabs);
}

function generateFallbackName(tabs) {
  // Simple fallback: use first tab's domain or title
  const firstTab = tabs[0];
  if (firstTab?.url) {
    try {
      const domain = new URL(firstTab.url).hostname.replace('www.', '');
      return `${domain} session`;
    } catch {}
  }
  return `Session - ${tabs.length} tabs`;
}
```

---

## ⚡ Availability Check

```javascript
// Check if Chrome AI is available
async function isChromAIAvailable() {
  if (typeof LanguageModel === 'undefined') {
    return { available: false, reason: 'API not found' };
  }
  
  try {
    const status = await LanguageModel.availability();
    return {
      available: status === 'available' || status === 'readily',
      status: status,
      downloadable: status === 'downloadable'
    };
  } catch (e) {
    return { available: false, reason: e.message };
  }
}

// Usage
const ai = await isChromAIAvailable();
console.log(ai);
// { available: true, status: 'available' }
// or
// { available: false, status: 'downloadable', downloadable: true }
```

---

## 📝 Important Notes

### First-Time Setup
- First call to `LanguageModel.create()` triggers model download (~1.5-2GB)
- Download took ~25 minutes in our testing
- Keep Chrome open during download
- After download, it's instant

### Model Status
Check `chrome://on-device-internals` → Model Status tab to see:
- Download progress
- Model readiness
- Error messages

### Performance
- `inputQuota: 9216` = ~9k token context window
- Small/fast for quick prompts
- Best for short responses (naming, categorization, summarization)
- Not ideal for long-form content generation

---

## 🔧 TypeScript Types

```typescript
// Type definitions for Chrome Built-in AI
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

---

## 🚀 Next Steps for BTMS

1. **Wrap in a service** - Create `ChromeAIService` class
2. **Add availability detection** - Check on extension startup
3. **Implement fallback** - Use Ollama or cloud API when not available
4. **Cache sessions** - Reuse sessions for better performance
5. **Handle quota** - Monitor `inputUsage` vs `inputQuota`

---

*Tested and verified on Fedora 43, Chrome 143.0.7499.169, December 2025*
