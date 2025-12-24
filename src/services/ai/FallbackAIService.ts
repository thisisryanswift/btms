import type { SessionTab } from '../../types/session';

/**
 * Fallback AI service for when Chrome Built-in AI is not available
 * Uses rule-based approaches and simple heuristics for naming and categorization
 */
export class FallbackAIService {
  private static instance: FallbackAIService;

  private constructor() {}

  static getInstance(): FallbackAIService {
    if (!FallbackAIService.instance) {
      FallbackAIService.instance = new FallbackAIService();
    }
    return FallbackAIService.instance;
  }

  /**
   * Generate session name using domain and content analysis
   */
  async generateSessionName(tabs: SessionTab[]): Promise<{
    success: boolean;
    name?: string;
    error?: string;
  }> {
    console.log('🏷️ Generating fallback session name from', tabs.length, 'tabs');

    try {
      const relevantTabs = tabs.filter(tab => 
        !tab.url.startsWith('chrome://') && 
        !tab.url.startsWith('chrome-extension://')
      );

      if (relevantTabs.length === 0) {
        return {
          success: true,
          name: 'System Session'
        };
      }

      // Analyze domains and topics
      const domains = this.extractDomains(relevantTabs);
      const topics = this.identifyTopics(relevantTabs);
      const patterns = this.identifyPatterns(relevantTabs);

      const name = this.generateNameFromAnalysis(domains, topics, patterns);
      
      return { success: true, name };

    } catch (error) {
      console.error('❌ Failed to generate fallback session name:', error);
      return {
        success: false,
        error: `Fallback name generation failed: ${error}`
      };
    }
  }

  /**
   * Generate session summary using simple rules
   */
  async generateSessionSummary(tabs: SessionTab[]): Promise<{
    success: boolean;
    summary?: string;
    error?: string;
  }> {
    console.log('📄 Generating fallback session summary from', tabs.length, 'tabs');

    try {
      const relevantTabs = tabs.filter(tab => 
        !tab.url.startsWith('chrome://') && 
        !tab.url.startsWith('chrome-extension://')
      );

      if (relevantTabs.length === 0) {
        return {
          success: true,
          summary: 'System and extension tabs'
        };
      }

      const domains = this.extractDomains(relevantTabs);
      const summary = this.generateSummaryFromAnalysis(domains, relevantTabs.length);
      
      return { success: true, summary };

    } catch (error) {
      console.error('❌ Failed to generate fallback session summary:', error);
      return {
        success: false,
        error: `Fallback summary generation failed: ${error}`
      };
    }
  }

  /**
   * Generate tags using keyword extraction and domain analysis
   */
  async generateSessionTags(tabs: SessionTab[]): Promise<{
    success: boolean;
    tags?: string[];
    error?: string;
  }> {
    console.log('🏷️ Generating fallback session tags from', tabs.length, 'tabs');

    try {
      const relevantTabs = tabs.filter(tab => 
        !tab.url.startsWith('chrome://') && 
        !tab.url.startsWith('chrome-extension://')
      );

      if (relevantTabs.length === 0) {
        return {
          success: true,
          tags: ['system']
        };
      }

      const tags = this.generateTagsFromAnalysis(relevantTabs);
      
      return { success: true, tags };

    } catch (error) {
      console.error('❌ Failed to generate fallback session tags:', error);
      return {
        success: false,
        error: `Fallback tags generation failed: ${error}`
      };
    }
  }

  /**
   * Check availability (always available for fallback)
   */
  async checkAvailability(): Promise<{
    available: boolean;
    status: string;
    reason: string;
  }> {
    return {
      available: true,
      status: 'available',
      reason: 'Rule-based fallback service always available'
    };
  }

  // Private helper methods

  private extractDomains(tabs: SessionTab[]): string[] {
    return tabs.map(tab => {
      try {
        return new URL(tab.url).hostname;
      } catch {
        return 'unknown';
      }
    });
  }

  private identifyTopics(tabs: SessionTab[]): string[] {
    const topics: string[] = [];
    
    // Development-focused keywords
    const devKeywords = [
      'github', 'stackoverflow', 'npm', 'react', 'vue', 'angular',
      'javascript', 'typescript', 'python', 'node', 'express',
      'docker', 'kubernetes', 'aws', 'azure', 'cloud'
    ];

    // Social/communication keywords
    const socialKeywords = [
      'twitter', 'facebook', 'instagram', 'linkedin', 'reddit',
      'youtube', 'discord', 'slack', 'teams', 'gmail'
    ];

    // Shopping keywords
    const shoppingKeywords = [
      'amazon', 'ebay', 'walmart', 'target', 'etsy', 'shopify',
      'booking', 'expedia', 'airbnb'
    ];

    // Research/education keywords
    const researchKeywords = [
      'wikipedia', 'medium', 'hackernoon', 'dev.to', 'coursera',
      'udemy', 'edx', 'mit', 'stanford'
    ];

    const allText = tabs.map(tab => `${tab.title} ${tab.url}`).join(' ').toLowerCase();

    if (devKeywords.some(keyword => allText.includes(keyword))) {
      topics.push('development');
    }
    
    if (socialKeywords.some(keyword => allText.includes(keyword))) {
      topics.push('social');
    }
    
    if (shoppingKeywords.some(keyword => allText.includes(keyword))) {
      topics.push('shopping');
    }
    
    if (researchKeywords.some(keyword => allText.includes(keyword))) {
      topics.push('research');
    }

    return topics;
  }

  private identifyPatterns(tabs: SessionTab[]): string[] {
    const patterns: string[] = [];
    
    // Check if multiple tabs from same domain
    const domains = this.extractDomains(tabs);
    const domainCounts = domains.reduce((acc, domain) => {
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hasMultipleFromSameDomain = Object.values(domainCounts).some(count => count > 2);
    if (hasMultipleFromSameDomain) {
      patterns.push('deep-dive');
    }

    // Check if search-heavy session
    const searchDomains = new Set(['google.com', 'bing.com', 'duckduckgo.com', 'yahoo.com']);
    const searchTabCount = domains.filter(domain => searchDomains.has(domain)).length;
    if (searchTabCount > 2) {
      patterns.push('research');
    }

    // Check if documentation-heavy
    const docKeywords = ['docs', 'documentation', 'api', 'reference', 'guide'];
    const allText = tabs.map(tab => `${tab.title} ${tab.url}`).join(' ').toLowerCase();
    if (docKeywords.some(keyword => allText.includes(keyword))) {
      patterns.push('documentation');
    }

    return patterns;
  }

  private generateNameFromAnalysis(domains: string[], topics: string[], patterns: string[]): string {
    // Primary domain approach
    const domainCounts = domains.reduce((acc, domain) => {
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDomain = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    const topic = topics[0];
    const pattern = patterns[0];

    // Build name based on analysis
    if (topic && pattern) {
      return `${topic.charAt(0).toUpperCase() + topic.slice(1)} - ${pattern}`;
    }

    if (topic && topDomain) {
      const cleanDomain = topDomain.replace('www.', '').split('.')[0];
      return `${topic.charAt(0).toUpperCase() + topic.slice(1)} - ${cleanDomain}`;
    }

    if (topic) {
      return topic.charAt(0).toUpperCase() + topic.slice(1);
    }

    if (topDomain) {
      const cleanDomain = topDomain.replace('www.', '').split('.')[0];
      return cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
    }

    return `Session ${new Date().toLocaleTimeString()}`;
  }

  private generateSummaryFromAnalysis(domains: string[], tabCount: number): string {
    const uniqueDomains = [...new Set(domains)];
    const primaryDomain = this.getMostCommonDomain(domains);
    
    if (uniqueDomains.length === 1) {
      return `${tabCount} tabs from ${primaryDomain}`;
    }
    
    if (uniqueDomains.length <= 3) {
      return `${tabCount} tabs across ${uniqueDomains.length} sites`;
    }
    
    return `Browsing session with ${tabCount} tabs`;
  }

  private generateTagsFromAnalysis(tabs: SessionTab[]): string[] {
    const tags: Set<string> = new Set();
    
    // Domain-based tags
    const domains = this.extractDomains(tabs);
    domains.forEach(domain => {
      const cleanDomain = domain.replace('www.', '').split('.')[0];
      if (cleanDomain && cleanDomain !== 'unknown' && cleanDomain.length < 15) {
        tags.add(cleanDomain);
      }
    });

    // Topic-based tags
    const topics = this.identifyTopics(tabs);
    topics.forEach(topic => tags.add(topic));

    // Pattern-based tags
    const patterns = this.identifyPatterns(tabs);
    patterns.forEach(pattern => tags.add(pattern));

    // Time-based tags
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      tags.add('work');
    } else if (hour >= 18 && hour <= 22) {
      tags.add('evening');
    } else {
      tags.add('late-night');
    }

    // Convert to array and limit
    const tagArray = Array.from(tags).slice(0, 5);
    return tagArray.length > 0 ? tagArray : ['browsing'];
  }

  private getMostCommonDomain(domains: string[]): string {
    const counts = domains.reduce((acc, domain) => {
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown';
  }
}