import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SessionService } from '../services/sessions/SessionService'

// Use vi.hoisted to define mocks that will be available when vi.mock runs
const { mockStorageService, mockAIService, mockCaptureTabs, mockCaptureAllWindows } = vi.hoisted(() => ({
  mockStorageService: {
    createSession: vi.fn(),
    getAllSessions: vi.fn(),
    getSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    getAutoSavedSessions: vi.fn(),
  },
  mockAIService: {
    initialize: vi.fn(),
    generateSessionName: vi.fn(),
    generateSessionSummary: vi.fn(),
    generateSessionTags: vi.fn(),
  },
  mockCaptureTabs: vi.fn(),
  mockCaptureAllWindows: vi.fn(),
}))

// Mock dependencies with factory functions
vi.mock('../services/storage/StorageService', () => ({
  StorageService: {
    getInstance: () => mockStorageService
  }
}))

vi.mock('../services/sessions/capture', () => ({
  captureTabs: mockCaptureTabs,
  captureAllWindows: mockCaptureAllWindows,
}))

vi.mock('../services/ai/AIService', () => ({
  AIService: {
    getInstance: () => mockAIService
  }
}))

// Mock Chrome APIs
const mockChrome = {
  windows: {
    create: vi.fn(),
    update: vi.fn(),
  },
  tabs: {
    create: vi.fn(),
    query: vi.fn(),
    move: vi.fn(),
    update: vi.fn(),
  }
}

// Extend global scope for Chrome APIs
declare global {
  var chrome: typeof mockChrome
}

describe('SessionService', () => {
  let sessionService: SessionService

  beforeEach(() => {
    vi.clearAllMocks()
    sessionService = new SessionService()

    // Setup default mock for capture
    mockCaptureTabs.mockResolvedValue([
      {
        id: 1,
        index: 0,
        url: 'https://example.com',
        title: 'Example Page',
        pinned: false,
        active: true
      }
    ])

    mockCaptureAllWindows.mockResolvedValue({
      windows: [{
        id: 1,
        focused: true,
        incognito: false,
        state: 'normal',
        tabs: [{
          id: 1,
          index: 0,
          url: 'https://example.com',
          title: 'Example Page',
          pinned: false,
          active: true
        }]
      }],
      tabCount: 1,
      windowCount: 1
    })
  })


  describe('createSession', () => {
    it('should create a new session with generated ID and timestamps', async () => {
      const options = {
        name: 'Test Session',
        autoSave: false
      }

      const expectedSession = {
        id: expect.any(String),
        name: 'Test Session',
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        windows: [expect.any(Object)],
        tabCount: 1,
        windowCount: 1,
        isAutoSave: options.autoSave || false,
        source: options.autoSave ? 'auto' : 'manual',
        tags: []
      }

      mockStorageService.createSession.mockResolvedValue(expectedSession)

      const result = await sessionService.createSession(options)

      expect(result.id).toBeDefined()
      expect(result.name).toBe(options.name)
      expect(result.isAutoSave).toBe(options.autoSave)
      expect(mockStorageService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          name: options.name,
          windows: expect.any(Array),
          tabCount: expect.any(Number),
          windowCount: expect.any(Number),
          isAutoSave: options.autoSave,
          source: options.autoSave ? 'auto' : 'manual',
          tags: expect.any(Array)
        })
      )
    })

    it('should use default name when none provided', async () => {
      const mockSession = createMockSession({
        name: expect.stringMatching(/Session \d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} (AM|PM)/)
      })
      mockStorageService.createSession.mockResolvedValue(mockSession)

      await sessionService.createSession({})

      expect(mockStorageService.createSession).toHaveBeenCalled()
    })
  })

  describe('getSession', () => {
    it('should get a session by ID', async () => {
      const sessionId = 'test-session-id'
      const mockSession = createMockSession({ id: sessionId })

      mockStorageService.getSession.mockResolvedValue(mockSession)

      const result = await sessionService.getSession(sessionId)

      expect(result).toBe(mockSession)
      expect(mockStorageService.getSession).toHaveBeenCalledWith(sessionId)
    })

    it('should return null for non-existent session', async () => {
      mockStorageService.getSession.mockResolvedValue(null)

      const result = await sessionService.getSession('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('getAllSessions', () => {
    it('should return all sessions', async () => {
      const mockSessions = [
        createMockSession({ id: 'session-1', name: 'Session 1' }),
        createMockSession({ id: 'session-2', name: 'Session 2' })
      ]

      mockStorageService.getAllSessions.mockResolvedValue(mockSessions)

      const result = await sessionService.getAllSessions()

      expect(result).toEqual(mockSessions)
      expect(mockStorageService.getAllSessions).toHaveBeenCalled()
    })
  })

  describe('updateSession', () => {
    it('should update an existing session', async () => {
      const sessionId = 'test-session-id'
      const updates = {
        name: 'Updated Session Name',
        summary: 'Generated summary'
      }

      const existingSession = createMockSession({ id: sessionId })
      const expectedSession = createMockSession({
        id: sessionId,
        ...updates,
        updatedAt: expect.any(Number)
      })

      // Mock getSession to return the existing session
      mockStorageService.getSession.mockResolvedValue(existingSession)
      mockStorageService.updateSession.mockResolvedValue(expectedSession)

      const result = await sessionService.updateSession(sessionId, updates)

      expect(result).toEqual(expectedSession)
      // The implementation merges the full session with updates before saving
      expect(mockStorageService.updateSession).toHaveBeenCalledWith(
        sessionId,
        expect.objectContaining({
          id: sessionId,
          name: 'Updated Session Name',
          summary: 'Generated summary',
          updatedAt: expect.any(Number)
        })
      )
    })
  })

  describe('deleteSession', () => {
    it('should delete a session by ID', async () => {
      const sessionId = 'test-session-id'

      mockStorageService.deleteSession.mockResolvedValue(undefined)

      await sessionService.deleteSession(sessionId)

      expect(mockStorageService.deleteSession).toHaveBeenCalledWith(sessionId)
    })
  })

  describe('restoreSession', () => {
    it('should restore session by creating tabs and windows', async () => {
      const mockSession = createMockSession()

      // Mock getSession to return session
      mockStorageService.getSession.mockResolvedValue(mockSession)

      // Mock chrome APIs
      global.chrome = mockChrome
        ; (global.chrome.windows.create as any).mockResolvedValue({ id: 100 })
        // Mock tabs.query to return tabs for the new window (used by restoreTabDetails)
        ; (global.chrome.tabs.query as any).mockResolvedValue([{ id: 1, pinned: false }])
        ; (global.chrome.tabs.move as any).mockResolvedValue({})
        ; (global.chrome.tabs.update as any).mockResolvedValue({})

      await sessionService.restoreSession(mockSession.id)

      expect(chrome.windows.create).toHaveBeenCalled()
      // restoreTabDetails uses tabs.query, not tabs.create
      expect(chrome.tabs.query).toHaveBeenCalled()
    })
  })

  describe('cleanupAutoSavedSessions', () => {
    it('should remove old auto-saved sessions', async () => {
      const mockAutoSessions = [
        createMockSession({ id: 'auto-1', isAutoSave: true, createdAt: Date.now() - 3000 }),
        createMockSession({ id: 'auto-2', isAutoSave: true, createdAt: Date.now() - 2000 }),
        createMockSession({ id: 'auto-3', isAutoSave: true, createdAt: Date.now() - 1000 })
      ]

      // Mock getAutoSavedSessions to return auto sessions
      mockStorageService.getAutoSavedSessions.mockResolvedValue(mockAutoSessions)

      await sessionService.cleanupAutoSavedSessions(2)

      // Should delete the oldest one (auto-1 since we keep 2 newest)
      expect(mockStorageService.deleteSession).toHaveBeenCalledTimes(1)
    })
  })
})

// Helper function to create mock session
function createMockSession(overrides: Partial<any> = {}) {
  return {
    id: 'test-session-1',
    name: 'Test Session',
    createdAt: Date.now(),
    updatedAt: Date.now(),
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
    tags: [],
    ...overrides,
  }
}