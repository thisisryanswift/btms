import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Chrome APIs
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
  },
  runtime: {
    getURL: vi.fn(),
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  windows: {
    getAll: vi.fn(),
    getCurrent: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    onRemoved: {
      addListener: vi.fn(),
    },
  },
  alarms: {
    create: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    clear: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
    },
  },
}

// Mock LanguageModel for Chrome AI
global.LanguageModel = {
  availability: vi.fn(),
  create: vi.fn(),
}

// Add custom matchers
expect.extend({
  toBeValidSession(received) {
    const required = ['id', 'name', 'createdAt', 'updatedAt', 'windows', 'tabCount', 'windowCount']
    const missing = required.filter(field => !(field in received))
    
    if (missing.length === 0) {
      return {
        message: () => `expected ${received} not to be a valid session`,
        pass: true,
      }
    }
    
    return {
      message: () => `expected ${received} to be a valid session, but missing fields: ${missing.join(', ')}`,
      pass: false,
    }
  },
})

// Global test utilities
global.createMockSession = (overrides = {}) => ({
  id: 'test-session-1',
  name: 'Test Session',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tags: [],
  windows: [
    {
      id: 1,
      focused: true,
      incognito: false,
      state: 'normal' as const,
      tabs: [
        {
          id: 1,
          index: 0,
          url: 'https://example.com',
          title: 'Example Page',
          pinned: false,
          active: true,
        }
      ],
    }
  ],
  tabCount: 1,
  windowCount: 1,
  isAutoSave: false,
  source: 'manual' as const,
  ...overrides,
})

global.createMockTab = (overrides = {}) => ({
  id: 1,
  index: 0,
  url: 'https://example.com',
  title: 'Example Page',
  pinned: false,
  active: true,
  groupId: undefined,
  ...overrides,
})

console.log('🧪 Test environment initialized')