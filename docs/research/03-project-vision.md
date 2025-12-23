# BTMS: Better Tab Management System
## Project Vision Document

> *An AI-first reimagining of browser session management*

---

## 🎯 Mission Statement

**Make browser session management invisible, intelligent, and delightful.**

Users shouldn't need to think about saving tabs. The extension should understand context, anticipate needs, and act as a helpful AI assistant for browsing productivity.

---

## 💡 Name Ideas

| Name | Notes |
|------|-------|
| **BTMS** | Better Tab Management System (working title) |
| **SessionAI** | AI focus, clear purpose |
| **TabMind** | Suggests intelligence |
| **Contextual** | About context awareness |
| **WorkBench** | Workspace metaphor |
| **FlowState** | About maintaining focus |
| **Tabular** | Tab + AI wordplay |
| **SessionSense** | Intelligence + awareness |

---

## 🎨 Design Philosophy

### Core Principles

1. **AI as Assistant, Not Master**
   - AI suggests, user decides
   - Easy override of all AI decisions
   - Transparent about what AI is doing

2. **Privacy First**
   - Local processing where possible
   - Clear consent for cloud features
   - No data sold or shared

3. **Progressive Disclosure**
   - Simple by default
   - Power features available but hidden
   - Smart defaults that work for 80% of users

4. **Delight in Details**
   - Smooth animations
   - Satisfying micro-interactions
   - Thoughtful empty states
   - Personality without being annoying

---

## 🏗️ MVP Feature Set

### Must Have (v1.0)
- [ ] Basic session save/restore
- [ ] Session list with search
- [ ] AI-generated session names
- [ ] Session summaries (AI one-liner)
- [ ] Auto-save on window close
- [ ] Export/Import sessions
- [ ] Clean, modern UI

### Should Have (v1.1)
- [ ] Semantic search (natural language)
- [ ] Duplicate tab detection
- [ ] Auto-categorization with tags
- [ ] Dark mode support
- [ ] Keyboard shortcuts

### Nice to Have (v1.2+)
- [ ] Natural language commands
- [ ] Chrome Tab Groups support
- [ ] Cloud sync (own backend or Google Drive)
- [ ] Browsing analytics
- [ ] Session templates
- [ ] Proactive suggestions

---

## 🧩 Technical Direction

### Frontend
- **Framework**: React + TypeScript (modern, type-safe)
- **Styling**: Tailwind CSS (rapid prototyping)
- **State**: Zustand or Jotai (simple, performant)
- **Build**: Vite or WXT (fast, extension-friendly)

### AI/ML ✅ VERIFIED WORKING
- **Primary**: Chrome Built-in AI (Gemini Nano) - FREE, local, private
  - Uses `LanguageModel` global API
  - ~9k token context, fast inference
  - Works on Fedora Linux with Chrome 143+
- **Fallback**: Ollama (local) or OpenAI/Claude API (cloud)
- **Embeddings**: TBD - OpenAI embeddings or local (all-MiniLM)
- **Search**: Vector similarity with cosine distance

### Storage
- **Sessions**: IndexedDB (large data, structured)
- **Settings**: chrome.storage.sync (small, synced)
- **Embeddings**: IndexedDB with vector storage

### Extension
- **Manifest**: V3 (Chrome)
- **Browsers**: Chrome-only (Edge/Brave get it free)
- **Service Worker**: For background operations
- **Side Panel**: AI assistant interface (Chrome-exclusive feature!)

---

## 🗺️ Development Roadmap

### Phase 0: Research (1 week) ✅
- [x] Analyze Tab Session Manager
- [x] Identify opportunities
- [x] Document features and gaps
- [x] Plan AI integration points

### Phase 1: Foundation (2-3 weeks)
- [ ] Set up extension project structure
- [ ] Basic popup UI
- [ ] Core session save/restore logic
- [ ] IndexedDB session storage
- [ ] Settings page

### Phase 2: Core AI Features (2-3 weeks)
- [ ] Integrate LLM for session naming
- [ ] Session summarization
- [ ] Basic semantic search
- [ ] Duplicate detection

### Phase 3: Polish (1-2 weeks)
- [ ] Refined UI/UX
- [ ] Error handling
- [ ] Performance optimization
- [ ] Testing

### Phase 4: Advanced (Ongoing)
- [ ] Natural language commands
- [ ] Analytics dashboard
- [ ] Cloud sync
- [ ] Community features

---

## 📊 Success Metrics

### User Experience
- Session save/restore works 100% reliably
- AI naming is useful 80%+ of the time
- Search finds the right session first try 90%+
- UI feels fast and responsive

### Technical
- Popup opens in <100ms
- Session restore in <2s
- No memory leaks
- Works with 500+ tab sessions

### Adoption (if published)
- 4.5+ star rating
- <2% critical bug reports
- Positive feedback on AI features

---

## 🤔 Open Questions

1. ~~**LLM Provider**: OpenAI vs Claude vs Local?~~ → **Decided: Chrome Built-in AI (Gemini Nano) as primary**
2. **Sync Strategy**: Google Drive like TSM, or custom backend?
3. **Pricing Model**: Free with limits? Paid? Free for personal use?
4. ~~**Firefox Support**: How much effort for cross-browser?~~ → **Decided: Chrome-only for now**
5. **Tab Groups**: Priority? Use Chrome's Tab Groups API?
6. **Voice Commands**: Worth the complexity?

---

## 📚 Resources

### Tab Session Manager
- [GitHub Repo](https://github.com/sienori/Tab-Session-Manager)
- [Firefox Add-on](https://addons.mozilla.org/firefox/addon/tab-session-manager/)
- [Chrome Extension](https://chrome.google.com/webstore/detail/tab-session-manager/iaiomicjabeggjcfkbimgmglanimpnae)

### Extension Development
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [WXT Framework](https://wxt.dev/) - Modern extension framework

### AI Integration
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Ollama](https://ollama.ai/) - Local LLMs
- [Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in) - Emerging

---

## 📝 Next Steps

1. Set up project with extension boilerplate
2. Create basic popup UI mockup
3. Implement core session save/restore
4. Add first AI feature (session naming)
5. Iterate based on usage

---

*Document created: 2025-12-22*
*Last updated: 2025-12-22*
