import { ChromeAIService } from './ChromeAIService';
import { FallbackAIService } from './FallbackAIService';
import type { SessionTab } from '../../types/session';

/**
 * Unified AI service that tries Chrome Built-in AI first, then falls back to rule-based analysis
 */
export class AIService {
  private static instance: AIService;
  private chromeAI: ChromeAIService;
  private fallbackAI: FallbackAIService;
  private useChromeAI: boolean = true;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    this.chromeAI = ChromeAIService.getInstance();
    this.fallbackAI = FallbackAIService.getInstance();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Initialize the AI service and determine which AI to use
   */
  async initialize(): Promise<{
    success: boolean;
    aiType: 'chrome' | 'fallback';
    reason?: string;
  }> {
    // Return existing initialization if in progress
    if (this.isInitialized) {
      return {
        success: true,
        aiType: this.useChromeAI ? 'chrome' : 'fallback',
        reason: 'Already initialized'
      };
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      return {
        success: true,
        aiType: this.useChromeAI ? 'chrome' : 'fallback',
        reason: 'Already initialized'
      };
    }

    // Start initialization
    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
    
    return {
      success: true,
      aiType: this.useChromeAI ? 'chrome' : 'fallback',
      reason: this.useChromeAI ? 'Chrome Built-in AI available' : 'Using fallback AI'
    };
  }

  private async performInitialization(): Promise<void> {
    console.log('🤖 Initializing AI service...');

    try {
      // Check Chrome AI availability
      const chromeAvailability = await this.chromeAI.checkAvailability();
      
      if (chromeAvailability.available) {
        console.log('✅ Chrome Built-in AI is available');
        
        // Try to initialize Chrome AI
        const chromeInit = await this.chromeAI.initialize();
        
        if (chromeInit.success) {
          console.log('🎉 Chrome AI initialized successfully');
          this.useChromeAI = true;
          this.isInitialized = true;
          return;
        } else {
          console.warn('⚠️ Chrome AI initialization failed:', chromeInit.error);
        }
      } else {
        console.warn('⚠️ Chrome AI not available:', chromeAvailability.reason);
      }
    } catch (error) {
      console.error('❌ Error during Chrome AI initialization:', error);
    }

    // Fall back to rule-based AI
    console.log('🔄 Falling back to rule-based AI service');
    this.useChromeAI = false;
    this.isInitialized = true;
  }

  /**
   * Generate session name using AI (Chrome AI preferred, fallback otherwise)
   */
  async generateSessionName(tabs: SessionTab[]): Promise<{
    success: boolean;
    name?: string;
    aiType?: 'chrome' | 'fallback';
    error?: string;
  }> {
    console.log('🏷️ Generating session name using AI...');

    // Ensure initialization
    await this.initialize();

    try {
      if (this.useChromeAI) {
        console.log('🤖 Using Chrome Built-in AI for naming');
        const result = await this.chromeAI.generateSessionName(tabs);
        
        if (result.success && result.name) {
          return {
            success: true,
            name: result.name,
            aiType: 'chrome'
          };
        } else {
          console.warn('⚠️ Chrome AI naming failed, trying fallback:', result.error);
          // Fall back to rule-based
          const fallbackResult = await this.fallbackAI.generateSessionName(tabs);
          return {
            ...fallbackResult,
            aiType: 'fallback'
          };
        }
      } else {
        console.log('🔧 Using fallback AI for naming');
        const result = await this.fallbackAI.generateSessionName(tabs);
        return {
          ...result,
          aiType: 'fallback'
        };
      }
    } catch (error) {
      console.error('❌ AI naming failed completely:', error);
      
      // Emergency fallback - basic naming
      return {
        success: true,
        name: this.generateEmergencyName(tabs),
        aiType: 'fallback'
      };
    }
  }

  /**
   * Generate session summary using AI
   */
  async generateSessionSummary(tabs: SessionTab[]): Promise<{
    success: boolean;
    summary?: string;
    aiType?: 'chrome' | 'fallback';
    error?: string;
  }> {
    console.log('📄 Generating session summary using AI...');

    // Ensure initialization
    await this.initialize();

    try {
      if (this.useChromeAI) {
        console.log('🤖 Using Chrome Built-in AI for summary');
        const result = await this.chromeAI.generateSessionSummary(tabs);
        
        if (result.success && result.summary) {
          return {
            success: true,
            summary: result.summary,
            aiType: 'chrome'
          };
        } else {
          console.warn('⚠️ Chrome AI summary failed, trying fallback:', result.error);
          const fallbackResult = await this.fallbackAI.generateSessionSummary(tabs);
          return {
            ...fallbackResult,
            aiType: 'fallback'
          };
        }
      } else {
        console.log('🔧 Using fallback AI for summary');
        const result = await this.fallbackAI.generateSessionSummary(tabs);
        return {
          ...result,
          aiType: 'fallback'
        };
      }
    } catch (error) {
      console.error('❌ AI summary failed completely:', error);
      
      return {
        success: true,
        summary: `${tabs.length} tabs saved`,
        aiType: 'fallback'
      };
    }
  }

  /**
   * Generate session tags using AI
   */
  async generateSessionTags(tabs: SessionTab[]): Promise<{
    success: boolean;
    tags?: string[];
    aiType?: 'chrome' | 'fallback';
    error?: string;
  }> {
    console.log('🏷️ Generating session tags using AI...');

    // Ensure initialization
    await this.initialize();

    try {
      if (this.useChromeAI) {
        console.log('🤖 Using Chrome Built-in AI for tags');
        const result = await this.chromeAI.generateSessionTags(tabs);
        
        if (result.success && result.tags && result.tags.length > 0) {
          return {
            success: true,
            tags: result.tags,
            aiType: 'chrome'
          };
        } else {
          console.warn('⚠️ Chrome AI tags failed, trying fallback:', result.error);
          const fallbackResult = await this.fallbackAI.generateSessionTags(tabs);
          return {
            ...fallbackResult,
            aiType: 'fallback'
          };
        }
      } else {
        console.log('🔧 Using fallback AI for tags');
        const result = await this.fallbackAI.generateSessionTags(tabs);
        return {
          ...result,
          aiType: 'fallback'
        };
      }
    } catch (error) {
      console.error('❌ AI tags failed completely:', error);
      
      return {
        success: true,
        tags: ['browsing'],
        aiType: 'fallback'
      };
    }
  }

  /**
   * Get AI service status
   */
  getAIStatus(): {
    type: 'chrome' | 'fallback';
    initialized: boolean;
    chromeAvailable?: boolean;
    chromeStatus?: string;
  } {
    return {
      type: this.useChromeAI ? 'chrome' : 'fallback',
      initialized: this.isInitialized,
      chromeAvailable: this.useChromeAI,
      chromeStatus: this.useChromeAI ? 'Available and ready' : 'Not available'
    };
  }

  /**
   * Reset AI service (useful for re-initialization)
   */
  reset(): void {
    console.log('🔄 Resetting AI service...');
    this.isInitialized = false;
    this.useChromeAI = true;
    this.initializationPromise = null;
    
    if (this.chromeAI) {
      this.chromeAI.destroy();
    }
  }

  // Private helper methods

  private generateEmergencyName(tabs: SessionTab[]): string {
    const relevantTabs = tabs.filter(tab => 
      !tab.url.startsWith('chrome://') && 
      !tab.url.startsWith('chrome-extension://')
    );

    if (relevantTabs.length === 0) {
      return 'System Session';
    }

    const domains = relevantTabs.map(tab => {
      try {
        return new URL(tab.url).hostname.replace('www.', '').split('.')[0];
      } catch {
        return 'unknown';
      }
    }).filter(domain => domain !== 'unknown');

    if (domains.length > 0) {
      const mostCommonDomain = this.getMostCommonString(domains);
      return `${mostCommonDomain.charAt(0).toUpperCase() + mostCommonDomain.slice(1)} Session`;
    }

    return `${relevantTabs.length} Tabs`;
  }

  private getMostCommonString(strings: string[]): string {
    const counts = strings.reduce((acc, str) => {
      acc[str] = (acc[str] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown';
  }
}