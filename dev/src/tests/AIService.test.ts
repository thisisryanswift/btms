import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AIService } from '../services/ai/AIService'

// Mock Chrome AI and Fallback services
vi.mock('../services/ai/ChromeAIService')
vi.mock('../services/ai/FallbackAIService')

describe('AIService', () => {
  let aiService: AIService
  let mockChromeAI: any
  let mockFallbackAI: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get mocked instances
    const { ChromeAIService } = await import('../services/ai/ChromeAIService')
    const { FallbackAIService } = await import('../services/ai/FallbackAIService')
    
    mockChromeAI = vi.mocked(ChromeAIService.getInstance())
    mockFallbackAI = vi.mocked(FallbackAIService.getInstance())
    
    // Set up default mocks
    mockChromeAI.checkAvailability = vi.fn()
    mockChromeAI.initialize = vi.fn()
    mockChromeAI.generateSessionName = vi.fn()
    mockChromeAI.generateSessionSummary = vi.fn()
    
    mockFallbackAI.generateSessionName = vi.fn()
    mockFallbackAI.generateSessionSummary = vi.fn()
    
    aiService = AIService.getInstance()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AIService.getInstance()
      const instance2 = AIService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('initialize', () => {
    it('should initialize with Chrome AI when available', async () => {
      mockChromeAI.checkAvailability.mockResolvedValue({ available: true })
      mockChromeAI.initialize.mockResolvedValue({ success: true })
      
      const result = await aiService.initialize()
      
      expect(result.success).toBe(true)
      expect(result.aiType).toBe('chrome')
      expect(mockChromeAI.checkAvailability).toHaveBeenCalled()
      expect(mockChromeAI.initialize).toHaveBeenCalled()
    })

    it('should fallback to rule-based AI when Chrome AI unavailable', async () => {
      mockChromeAI.checkAvailability.mockResolvedValue({ available: false, reason: 'Not available' })
      
      const result = await aiService.initialize()
      
      expect(result.success).toBe(true)
      expect(result.aiType).toBe('fallback')
      expect(mockFallbackAI.generateSessionName).not.toHaveBeenCalled()
    })

    it('should fallback to rule-based AI when Chrome AI initialization fails', async () => {
      mockChromeAI.checkAvailability.mockResolvedValue({ available: true })
      mockChromeAI.initialize.mockResolvedValue({ success: false, error: 'Init failed' })
      
      const result = await aiService.initialize()
      
      expect(result.success).toBe(true)
      expect(result.aiType).toBe('fallback')
    })
  })

  describe('generateSessionName', () => {
    it('should use Chrome AI when available', async () => {
      const mockTabs = createMockTabs()
      const expectedResponse = {
        success: true,
        name: 'Shopping Research Project',
        aiType: 'chrome'
      }
      
      mockChromeAI.checkAvailability.mockResolvedValue({ available: true })
      mockChromeAI.initialize.mockResolvedValue({ success: true })
      mockChromeAI.generateSessionName.mockResolvedValue(expectedResponse)
      
      await aiService.initialize()
      const result = await aiService.generateSessionName(mockTabs)
      
      expect(result).toEqual(expectedResponse)
      expect(mockChromeAI.generateSessionName).toHaveBeenCalledWith(mockTabs)
    })

    it('should fallback AI when Chrome AI fails to generate name', async () => {
      const mockTabs = createMockTabs()
      const fallbackResponse = {
        success: true,
        name: 'E-commerce Shopping',
        aiType: 'fallback'
      }
      
      mockChromeAI.checkAvailability.mockResolvedValue({ available: true })
      mockChromeAI.initialize.mockResolvedValue({ success: true })
      mockChromeAI.generateSessionName.mockRejectedValue(new Error('Chrome AI failed'))
      mockFallbackAI.generateSessionName.mockResolvedValue(fallbackResponse)
      
      await aiService.initialize()
      const result = await aiService.generateSessionName(mockTabs)
      
      expect(result).toEqual(fallbackResponse)
      expect(mockFallbackAI.generateSessionName).toHaveBeenCalledWith(mockTabs)
    })

    it('should return fallback response when both AIs fail', async () => {
      const mockTabs = createMockTabs()
      
      mockChromeAI.checkAvailability.mockResolvedValue({ available: false })
      mockFallbackAI.generateSessionName.mockRejectedValue(new Error('Fallback failed'))
      
      await aiService.initialize()
      const result = await aiService.generateSessionName(mockTabs)
      
      expect(result.success).toBe(false)
      expect(result.reason).toBeDefined()
    })
  })

  describe('generateSessionSummary', () => {
    it('should generate summary using Chrome AI when available', async () => {
      const mockTabs = createMockTabs()
      const expectedResponse = {
        success: true,
        summary: 'Shopping for electronics and clothing',
        aiType: 'chrome'
      }
      
      mockChromeAI.checkAvailability.mockResolvedValue({ available: true })
      mockChromeAI.initialize.mockResolvedValue({ success: true })
      mockChromeAI.generateSessionSummary.mockResolvedValue(expectedResponse)
      
      await aiService.initialize()
      const result = await aiService.generateSessionSummary(mockTabs)
      
      expect(result).toEqual(expectedResponse)
      expect(mockChromeAI.generateSessionSummary).toHaveBeenCalledWith(mockTabs)
    })

    it('should use fallback AI when Chrome AI unavailable', async () => {
      const mockTabs = createMockTabs()
      const expectedResponse = {
        success: true,
        summary: 'Mixed shopping cart with tech and fashion items',
        aiType: 'fallback'
      }
      
      mockChromeAI.checkAvailability.mockResolvedValue({ available: false })
      mockFallbackAI.generateSessionSummary.mockResolvedValue(expectedResponse)
      
      await aiService.initialize()
      const result = await aiService.generateSessionSummary(mockTabs)
      
      expect(result).toEqual(expectedResponse)
      expect(mockFallbackAI.generateSessionSummary).toHaveBeenCalledWith(mockTabs)
    })
  })

  describe('error handling', () => {
    it('should handle initialization errors gracefully', async () => {
      mockChromeAI.checkAvailability.mockRejectedValue(new Error('API error'))
      
      const result = await aiService.initialize()
      
      expect(result.success).toBe(false)
      expect(result.reason).toBeDefined()
    })

    it('should handle generation errors gracefully', async () => {
      const mockTabs = createMockTabs()
      
      mockChromeAI.checkAvailability.mockResolvedValue({ available: true })
      mockChromeAI.initialize.mockResolvedValue({ success: true })
      mockChromeAI.generateSessionName.mockRejectedValue(new Error('Generation failed'))
      mockFallbackAI.generateSessionName.mockRejectedValue(new Error('Fallback failed'))
      
      await aiService.initialize()
      const result = await aiService.generateSessionName(mockTabs)
      
      expect(result.success).toBe(false)
      expect(result.reason).toBeDefined()
    })
  })

  describe('type validation', () => {
    it('should validate tabs input format', async () => {
      const invalidTabs = [{ url: 'not-a-valid-tab', id: 1, index: 0, title: 'Test', pinned: false, active: true }]
      
      mockChromeAI.checkAvailability.mockResolvedValue({ available: true })
      mockChromeAI.initialize.mockResolvedValue({ success: true })
      
      await aiService.initialize()
      
      // Should not throw with invalid input, but return error response
      const result = await aiService.generateSessionName(invalidTabs)
      
      expect(typeof result.success).toBe('boolean')
    })
  })
})

// Helper function to create mock tabs
function createMockTabs() {
  return [
    {
      id: 1,
      index: 0,
      url: 'https://amazon.com',
      title: 'Amazon - Online Shopping',
      pinned: false,
      active: true,
    },
    {
      id: 2,
      index: 1,
      url: 'https://bestbuy.com',
      title: 'Best Buy - Electronics',
      pinned: false,
      active: false,
    },
    {
      id: 3,
      index: 2,
      url: 'https://gap.com',
      title: 'Gap - Clothing Store',
      pinned: false,
      active: false,
    }
  ]
}