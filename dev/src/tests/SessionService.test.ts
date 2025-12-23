import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SessionService } from '../services/sessions/SessionService'

// Mock dependencies
vi.mock('../services/storage/StorageService')
vi.mock('../services/sessions/capture')
vi.mock('../services/ai/AIService')

// Mock Chrome APIs
const mockChrome = {
  windows: {
    create: vi.fn(),
    update: vi.fn(),
  },
  tabs: {
    create: vi.fn()
  }
}

// Extend global scope for Chrome APIs
declare global {
  var chrome: typeof mockChrome
}

describe('SessionService', () => {
  let sessionService: SessionService
  let mockStorageService: any

  beforeEach(async () => {
    vi.clearAllMocks()
    sessionService = new SessionService()
    
    // Get mocked instances
    const { StorageService } = await import('../services/storage/StorageService')
    mockStorageService = vi.mocked(StorageService.getInstance())
    
    // Set up default mocks
    mockStorageService.createSession = vi.fn()
    mockStorageService.getAllSessions = vi.fn()
    mockStorageService.updateSession = vi.fn()
    mockStorageService.deleteSession = vi.fn()
    
    // Mock captureTabs
    const { captureTabs } = await import('../services/sessions/capture')
    vi.mocked(captureTabs).mockResolvedValue([
      {
        id: 1,
        index: 0,
        url: 'https://example.com',
        title: 'Example Page',
        pinned: false,
        active: true
      }
    ])
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
      
      // Mock the storage service getSession method
      const { StorageService } = await import('../services/storage/StorageService')
      const mockedStorage = vi.mocked(StorageService.getInstance())
      mockedStorage.getSession = vi.fn().mockResolvedValue(mockSession)
      
      const result = await sessionService.getSession(sessionId)
      
      expect(result).toBe(mockSession)
      expect(mockedStorage.getSession).toHaveBeenCalledWith(sessionId)
    })

    it('should return null for non-existent session', async () => {
      const { StorageService } = await import('../services/storage/StorageService')
      const mockedStorage = vi.mocked(StorageService.getInstance())
      mockedStorage.getSession = vi.fn().mockResolvedValue(null)
      
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
      
      const expectedSession = createMockSession({
        id: sessionId,
        ...updates,
        updatedAt: expect.any(Number)
      })

      mockStorageService.updateSession.mockResolvedValue(expectedSession)
      
      const result = await sessionService.updateSession(sessionId, updates)
      
      expect(result).toEqual(expectedSession)
      expect(mockStorageService.updateSession).toHaveBeenCalledWith(sessionId, updates)
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
      const { StorageService } = await import('../services/storage/StorageService')
      const mockedStorage = vi.mocked(StorageService.getInstance())
      mockedStorage.getSession = vi.fn().mockResolvedValue(mockSession)
      
      // Mock chrome APIs
      global.chrome = mockChrome
      ;(global.chrome.windows.create as any).mockResolvedValue({ id: 100 })
      
      await sessionService.restoreSession(mockSession.id)
      
      expect(chrome.windows.create).toHaveBeenCalled()
      expect(chrome.tabs.create).toHaveBeenCalled()
    })
  })

  describe('cleanupAutoSavedSessions', () => {
    it('should remove old auto-saved sessions', async () => {
      const mockSessions = [
        createMockSession({ id: 'manual-1', isAutoSave: false }),
        createMockSession({ id: 'auto-1', isAutoSave: true }),
        createMockSession({ id: 'auto-2', isAutoSave: true }),
        createMockSession({ id: 'auto-3', isAutoSave: true })
      ]
      
      mockStorageService.getAllSessions.mockResolvedValue(mockSessions)
      mockStorageService.deleteSession = vi.fn().mockResolvedValue(undefined)
      
      await sessionService.cleanupAutoSavedSessions(2)
      
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