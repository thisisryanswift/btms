import type {
  LanguageModelSession,
  LanguageModelCreateOptions,
  LanguageModelAvailability
} from '../../types/chrome-ai';
import type { Session, SessionTab } from '../../types/session';

/**
 * Service for Chrome Built-in AI (Gemini Nano) operations
 * Provides session naming, summarization, and other AI features
 */
export class ChromeAIService {
  private static instance: ChromeAIService;
  private model: LanguageModelSession | null = null;
  private isInitialized = false;
  private sessionCache = new Map<string, any>();
  private cacheMaxSize = 50;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  private constructor() { }

  static getInstance(): ChromeAIService {
    if (!ChromeAIService.instance) {
      ChromeAIService.instance = new ChromeAIService();
    }
    return ChromeAIService.instance;
  }

  /**
   * Check if Chrome Built-in AI is available
   */
  async checkAvailability(): Promise<{
    available: boolean;
    status: LanguageModelAvailability;
    apiExists: boolean;
    reason?: string;
  }> {
    console.log('🔍 Checking Chrome AI availability...');

    // Check if LanguageModel global exists
    if (typeof LanguageModel === 'undefined') {
      console.warn('❌ LanguageModel API not found (not in Chrome or wrong version)');
      return {
        available: false,
        status: 'no',
        apiExists: false,
        reason: 'LanguageModel API not available. Make sure Chrome AI is enabled in chrome://flags/'
      };
    }

    console.log('✅ LanguageModel API found');

    try {
      const status = await LanguageModel.availability();
      console.log('📊 Chrome AI availability status:', status);

      const isAvailable = status === 'available' || status === 'readily';

      return {
        available: isAvailable,
        status,
        apiExists: true,
        reason: isAvailable ? 'Chrome AI is ready to use' : `AI status: ${status}`
      };

    } catch (error) {
      console.error('❌ Error checking Chrome AI availability:', error);
      return {
        available: false,
        status: 'no',
        apiExists: true,
        reason: `Error checking availability: ${error}`
      };
    }
  }

  /**
   * Initialize the AI model
   */
  async initialize(options?: LanguageModelCreateOptions): Promise<{
    success: boolean;
    model?: LanguageModelSession;
    error?: string;
  }> {
    if (this.isInitialized && this.model) {
      console.log('✅ Chrome AI already initialized');
      return { success: true, model: this.model };
    }

    console.log('🚀 Initializing Chrome AI model...');

    const availability = await this.checkAvailability();
    if (!availability.available) {
      return {
        success: false,
        error: availability.reason || 'Chrome AI not available'
      };
    }

    try {
      const defaultOptions: LanguageModelCreateOptions = {
        expectedInputLanguages: ['en'],
        expectedOutputLanguages: ['en'],
        temperature: 0.3, // Lower temperature for more consistent naming
        topK: 2, // Fewer choices for more focused responses
      };

      const model = await LanguageModel.create({ ...defaultOptions, ...options });

      this.model = model;
      this.isInitialized = true;

      console.log('✅ Chrome AI model initialized successfully');
      console.log('📋 Model config:', {
        temperature: model.temperature,
        topK: model.topK,
        inputQuota: model.inputQuota,
      });

      return { success: true, model };

    } catch (error) {
      console.error('❌ Failed to initialize Chrome AI model:', error);
      return {
        success: false,
        error: `Model initialization failed: ${error}`
      };
    }
  }

  /**
   * Generate a name for a session based on its tabs
   */
  async generateSessionName(tabs: SessionTab[]): Promise<{
    success: boolean;
    name?: string;
    error?: string;
  }> {
    console.log('🏷️ Generating session name from', tabs.length, 'tabs');

    if (!this.model) {
      const initResult = await this.initialize();
      if (!initResult.success || !initResult.model) {
        return {
          success: false,
          error: initResult.error || 'Failed to initialize AI model'
        };
      }
      this.model = initResult.model;
    }

    try {
      // Extract key information from tabs
      const tabInfo = tabs
        .filter(tab => !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'))
        .slice(0, 10) // Limit to 10 most relevant tabs
        .map(tab => ({
          title: tab.title,
          url: this.extractDomain(tab.url),
        }));

      if (tabInfo.length === 0) {
        return {
          success: false,
          error: 'No relevant tabs to analyze'
        };
      }

      const prompt = this.buildSessionNamePrompt(tabInfo);
      console.log('📝 Sending prompt to AI:', prompt);

      const response = await this.model.prompt(prompt);
      const name = this.cleanSessionName(response);

      console.log('✅ Generated session name:', name);

      return { success: true, name };

    } catch (error) {
      console.error('❌ Failed to generate session name:', error);
      return {
        success: false,
        error: `Name generation failed: ${error}`
      };
    }
  }

  /**
   * Generate a summary for a session
   */
  async generateSessionSummary(tabs: SessionTab[]): Promise<{
    success: boolean;
    summary?: string;
    error?: string;
  }> {
    console.log('📄 Generating session summary from', tabs.length, 'tabs');

    if (!this.model) {
      const initResult = await this.initialize();
      if (!initResult.success || !initResult.model) {
        return {
          success: false,
          error: initResult.error || 'Failed to initialize AI model'
        };
      }
      this.model = initResult.model;
    }

try {
      const tabData = tabs
        .filter(tab => !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'))
        .slice(0, 20)
        .map(tab => ({
          title: tab.title,
          url: this.extractDomain(tab.url),
        }));

      if (tabData.length === 0) {
        return {
          success: false,
          error: 'No relevant tabs to analyze'
        };
      }

      // Check cache first
      const cacheKey = this.generateCacheKey('sessionTags', tabData);
      const cachedResult = this.getCachedResult<{ success: boolean; tags?: string[]; error?: string }>(cacheKey);
      
      if (cachedResult) {
        return cachedResult;
      }

      const prompt = this.buildSessionTagsPrompt(tabData);
      const response = await this.model.prompt(prompt);
      const tags = this.cleanSessionTags(response);
      
      const result = { success: true, tags };
      
      // Cache the result
      this.setCachedResult(cacheKey, result);

      return result;

    } catch (error) {
      console.error('❌ Failed to generate session summary:', error);
      return {
        success: false,
        error: `Summary generation failed: ${error}`
      };
    }
  }

  /**
   * Generate suggested tags for a session
   */
  async generateSessionTags(tabs: SessionTab[]): Promise<{
    success: boolean;
    tags?: string[];
    error?: string;
  }> {
    console.log('🏷️ Generating session tags from', tabs.length, 'tabs');

    if (!this.model) {
      const initResult = await this.initialize();
      if (!initResult.success || !initResult.model) {
        return {
          success: false,
          error: initResult.error || 'Failed to initialize AI model'
        };
      }
      this.model = initResult.model;
    }

try {
      const tabData = tabs
        .filter(tab => !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'))
        .slice(0, 10)
        .map(tab => ({
          title: tab.title,
          url: this.extractDomain(tab.url),
        }));

      if (tabData.length === 0) {
        return {
          success: false,
          error: 'No relevant tabs to analyze'
        };
      }

      // Check cache first
      const cacheKey = this.generateCacheKey('sessionName', tabData);
      const cachedResult = this.getCachedResult<{ success: boolean; name?: string; error?: string }>(cacheKey);
      
      if (cachedResult) {
        return cachedResult;
      }

      const prompt = this.buildSessionNamePrompt(tabData);
      const response = await this.model.prompt(prompt);
      const name = this.cleanSessionName(response);
      
      const result = { success: true, name };
      
      // Cache the result
      this.setCachedResult(cacheKey, result);

      return result;

    } catch (error) {
      console.error('❌ Failed to generate session tags:', error);
      return {
        success: false,
        error: `Tags generation failed: ${error}`
      };
    }
  }

  /**
   * Get model usage statistics
   */
  getUsageStats(): { inputUsage: number; inputQuota: number } | null {
    if (!this.model) return null;

    return {
      inputUsage: this.model.inputUsage,
      inputQuota: this.model.inputQuota,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.model) {
      this.model.destroy();
      this.model = null;
      this.isInitialized = false;
      console.log('🧹 Chrome AI service cleaned up');
    }
  }

  // Private helper methods

  /**
   * Generate cache key from input data
   */
  private generateCacheKey(type: string, data: any): string {
    const hash = this.simpleHash(JSON.stringify({ type, data }));
    return `${type}_${hash}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached result if available and not expired
   */
  private getCachedResult<T>(key: string): T | null {
    const cached = this.sessionCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.sessionCache.delete(key);
      return null;
    }

    console.log(`🎯 Cache hit for ${key}`);
    return cached.data as T;
  }

  /**
   * Store result in cache
   */
  private setCachedResult<T>(key: string, data: T): void {
    // Clean old entries if cache is full
    if (this.sessionCache.size >= this.cacheMaxSize) {
      const oldestKey = this.sessionCache.keys().next().value;
      if (oldestKey) {
        this.sessionCache.delete(oldestKey);
      }
    }

    this.sessionCache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 Cached result for ${key} (cache size: ${this.sessionCache.size})`);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.sessionCache.clear();
    console.log('🧹 Chrome AI cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; ttlMinutes: number } {
    return {
      size: this.sessionCache.size,
      maxSize: this.cacheMaxSize,
      ttlMinutes: this.cacheTTL / (60 * 1000)
    };
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  private buildSessionNamePrompt(tabInfo: Array<{ title: string; url: string }>): string {
    const tabsText = tabInfo.map((tab, i) =>
      `${i + 1}. ${tab.title} (${tab.url})`
    ).join('\n');

    return `Based on these browser tabs, suggest a concise, descriptive session name (max 60 characters):

${tabsText}

Requirements:
- Maximum 60 characters
- Focus on the main theme or purpose
- Be specific but not too detailed
- Examples: "React Development Setup", "Research - Web3", "Shopping - Electronics"

Respond with only the session name, nothing else.`;
  }

  private buildSessionSummaryPrompt(tabInfo: Array<{ title: string; url: string }>): string {
    const tabsText = tabInfo.map((tab, i) =>
      `${i + 1}. ${tab.title} (${tab.url})`
    ).join('\n');

    return `Based on these browser tabs, provide a very brief one-line summary (max 100 characters):

${tabsText}

Requirements:
- Maximum 100 characters
- Capture the main activity or theme
- Be descriptive but concise
- Examples: "Setting up React development environment", "Comparing Web3 platforms"

Respond with only the summary, nothing else.`;
  }

  private buildSessionTagsPrompt(tabInfo: Array<{ title: string; url: string }>): string {
    const tabsText = tabInfo.map((tab, i) =>
      `${i + 1}. ${tab.title} (${tab.url})`
    ).join('\n');

    return `Based on these browser tabs, suggest 3-5 relevant tags (lowercase, single words):

${tabsText}

Requirements:
- 3-5 tags maximum
- Single words, lowercase
- Focus on technology, activity, or topic
- Examples: development, shopping, research, tutorial, comparison

Respond with tags separated by commas (e.g., development, react, tutorial)`;
  }

  private cleanSessionName(response: string): string {
    const cleaned = response.trim().replace(/^["']|["']$/g, '');
    return cleaned.length > 60 ? cleaned.substring(0, 60) : cleaned;
  }

  private cleanSessionSummary(response: string): string {
    const cleaned = response.trim().replace(/^["']|["']$/g, '');
    return cleaned.length > 100 ? cleaned.substring(0, 100) : cleaned;
  }

  private cleanSessionTags(response: string): string[] {
    const cleaned = response.trim().replace(/^["']|["']$/g, '');
    return cleaned
      .split(',')
      .map(tag => tag.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(tag => tag.length > 0 && tag.length <= 20)
      .slice(0, 5);
  }
}