import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageService } from '../services/storage/StorageService'

// Mock the read/write/delete operations
vi.mock('../services/storage/read')
vi.mock('../services/storage/write') 
vi.mock('../services/storage/delete')

describe('StorageService', () => {
  let storageService: StorageService

  beforeEach(() => {
    storageService = StorageService.getInstance()
    vi.clearAllMocks()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = StorageService.getInstance()
      const instance2 = StorageService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Read operations', () => {
    it('should get session by id', async () => {
      const mockSession = createMockSession()
      const { getSession } = await import('../services/storage/read')
      vi.mocked(getSession).mockResolvedValue(mockSession)

      const result = await storageService.getSession('test-id')
      
      expect(getSession).toHaveBeenCalledWith('test-id')
      expect(result).toBe(mockSession)
    })

    it('should get all sessions', async () => {
      const mockSessions = [createMockSession(), createMockSession({ id: 'session-2' })]
      const { getAllSessions } = await import('../services/storage/read')
      vi.mocked(getAllSessions).mockResolvedValue(mockSessions)

      const result = await storageService.getAllSessions()
      
      expect(getAllSessions).toHaveBeenCalled()
      expect(result).toEqual(mockSessions)
    })

    it('should get sessions by name', async () => {
      const mockSessions = [createMockSession({ name: 'Test Session' })]
      const { getSessionsByName } = await import('../services/storage/read')
      vi.mocked(getSessionsByName).mockResolvedValue(mockSessions)

      const result = await storageService.getSessionsByName('Test')
      
      expect(getSessionsByName).toHaveBeenCalledWith('Test')
      expect(result).toEqual(mockSessions)
    })

    it('should get sessions by tag', async () => {
      const mockSessions = [createMockSession({ tags: ['work', 'important'] })]
      const { getSessionsByTag } = await import('../services/storage/read')
      vi.mocked(getSessionsByTag).mockResolvedValue(mockSessions)

      const result = await storageService.getSessionsByTag('work')
      
      expect(getSessionsByTag).toHaveBeenCalledWith('work')
      expect(result).toEqual(mockSessions)
    })
  })

  describe('Write operations', () => {
    it('should create session', async () => {
      const mockSession = createMockSession()
      const { createSession } = await import('../services/storage/write')
      vi.mocked(createSession).mockResolvedValue(mockSession)

      const sessionData = {
        name: 'Test Session',
        windows: mockSession.windows,
        tabCount: 1,
        windowCount: 1,
        isAutoSave: false,
        source: 'manual' as const,
        tags: [],
      }

      const result = await storageService.createSession(sessionData)
      
      expect(createSession).toHaveBeenCalledWith(sessionData)
      expect(result).toBe(mockSession)
    })

    it('should update session', async () => {
      const mockSession = createMockSession()
      const { updateSession } = await import('../services/storage/write')
      vi.mocked(updateSession).mockResolvedValue(mockSession)

      const result = await storageService.updateSession('test-id', { name: 'Updated' })
      
      expect(updateSession).toHaveBeenCalledWith('test-id', { name: 'Updated' })
      expect(result).toBe(mockSession)
    })
  })

  describe('Delete operations', () => {
    it('should delete session by id', async () => {
      const { deleteSession } = await import('../services/storage/delete')
      vi.mocked(deleteSession).mockResolvedValue(undefined)

      await storageService.deleteSession('test-id')
      
      expect(deleteSession).toHaveBeenCalledWith('test-id')
    })

    it('should delete multiple sessions', async () => {
      const { deleteSessions } = await import('../services/storage/delete')
      vi.mocked(deleteSessions).mockResolvedValue(undefined)

      await storageService.deleteSessions(['id1', 'id2'])
      
      expect(deleteSessions).toHaveBeenCalledWith(['id1', 'id2'])
    })

    it('should delete all sessions', async () => {
      const { deleteAllSessions } = await import('../services/storage/delete')
      vi.mocked(deleteAllSessions).mockResolvedValue(undefined)

      await storageService.deleteAllSessions()
      
      expect(deleteAllSessions).toHaveBeenCalled()
    })
  })

  describe('Utility methods', () => {
    it('should get session count', async () => {
      const mockSessions = [createMockSession(), createMockSession()]
      const { getAllSessions } = await import('../services/storage/read')
      vi.mocked(getAllSessions).mockResolvedValue(mockSessions)

      const count = await storageService.getSessionCount()
      
      expect(count).toBe(2)
    })

    it('should get total tab count', async () => {
      const mockSessions = [
        createMockSession({ tabCount: 2 }),
        createMockSession({ id: 'session-2', tabCount: 3 })
      ]
      const { getAllSessions } = await import('../services/storage/read')
      vi.mocked(getAllSessions).mockResolvedValue(mockSessions)

      const total = await storageService.getTotalTabCount()
      
      expect(total).toBe(5)
    })

    it('should search sessions', async () => {
      const mockSessions = [createMockSession({ name: 'Test Session' })]
      const { getSessionsByName } = await import('../services/storage/read')
      vi.mocked(getSessionsByName).mockResolvedValue(mockSessions)

      const result = await storageService.searchSessions('Test')
      
      expect(getSessionsByName).toHaveBeenCalledWith('Test')
      expect(result).toEqual(mockSessions)
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
  }
}