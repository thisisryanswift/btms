import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIService } from '../services/ai/AIService';
import type { SessionTab } from '../types/session';

/**
 * Query keys for AI-related queries
 */
export const AI_QUERY_KEYS = {
    status: ['ai', 'status'] as const,
    initialization: ['ai', 'initialization'] as const,
} as const;

/**
 * Hook to get AI service status
 * Returns whether Chrome AI or fallback is being used
 */
export function useAIStatus() {
    return useQuery({
        queryKey: AI_QUERY_KEYS.status,
        queryFn: async () => {
            const aiService = AIService.getInstance();
            return aiService.getAIStatus();
        },
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook to initialize AI service
 * Call this once when the app starts
 */
export function useAIInitialization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const aiService = AIService.getInstance();
            return aiService.initialize();
        },
        onSuccess: () => {
            // Invalidate status query after initialization
            queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.status });
        },
    });
}

/**
 * Hook to generate AI session name
 */
export function useGenerateSessionName() {
    return useMutation({
        mutationFn: async (tabs: SessionTab[]) => {
            const aiService = AIService.getInstance();
            return aiService.generateSessionName(tabs);
        },
    });
}

/**
 * Hook to generate AI session summary
 */
export function useGenerateSessionSummary() {
    return useMutation({
        mutationFn: async (tabs: SessionTab[]) => {
            const aiService = AIService.getInstance();
            return aiService.generateSessionSummary(tabs);
        },
    });
}

/**
 * Hook to generate AI session tags
 */
export function useGenerateSessionTags() {
    return useMutation({
        mutationFn: async (tabs: SessionTab[]) => {
            const aiService = AIService.getInstance();
            return aiService.generateSessionTags(tabs);
        },
    });
}

/**
 * Combined hook for all AI generation features
 * Provides a convenient way to generate name, summary, and tags in one call
 */
export function useAIGeneration() {
    const generateName = useGenerateSessionName();
    const generateSummary = useGenerateSessionSummary();
    const generateTags = useGenerateSessionTags();

    return {
        generateName,
        generateSummary,
        generateTags,
        isGenerating: generateName.isPending || generateSummary.isPending || generateTags.isPending,
    };
}
