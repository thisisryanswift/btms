import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Session } from '../types/session';
import { captureAllWindows } from '../services/sessions/capture';
import { generateSessionId } from '../lib/uuid';
import { addSession, deleteSession, getSession } from '../lib/storage';

// Session capture using unified capture service
async function captureCurrentSession(options: {
  name?: string;
  autoSave?: boolean;
  activeOnly?: boolean;
  useAINaming?: boolean;
}): Promise<Session> {
  console.log('🚀 Capturing session...');

  // Use unified capture function
  const captured = await captureAllWindows({
    excludeIncognito: true,
    includeGroups: true,
  });

  // Flatten tabs for AI naming
  const allTabs = captured.windows.flatMap(w => w.tabs);

  // Generate AI name if requested and no manual name provided
  let sessionName = options.name;
  if (!sessionName && options.useAINaming) {
    console.log('🤖 Generating AI session name...');
    try {
      // Import AI service dynamically to avoid circular imports
      const { AIService } = await import('../services/ai/AIService');
      const aiService = AIService.getInstance();

      const aiResult = await aiService.generateSessionName(allTabs);
      if (aiResult.success && aiResult.name) {
        sessionName = aiResult.name;
        console.log('✅ Generated AI name:', sessionName, '(using', aiResult.aiType, 'AI)');
      } else {
        console.warn('⚠️ AI naming failed:', aiResult.error);
      }
    } catch (error) {
      console.error('❌ Error during AI naming:', error);
    }
  }

  // Create session using captured data
  const session: Session = {
    id: generateSessionId(),
    name: sessionName || `Session ${new Date().toLocaleString()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: [],
    windows: captured.windows,
    tabCount: captured.tabCount,
    windowCount: captured.windowCount,
    isAutoSave: options.autoSave ?? false,
    source: 'manual' as const,
  };

  // Save to storage using shared utility
  await addSession(session);

  console.log('✅ Session saved:', session.id);
  return session;
}

export function useCaptureCurrentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: captureCurrentSession,
    onSuccess: () => {
      console.log('🔄 Invalidating sessions cache');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error) => {
      console.error('❌ Failed to capture session:', error);
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteSession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useRestoreSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🔄 Restoring session:', id);

      // Get the session using shared utility
      const session = await getSession(id);

      if (!session) {
        throw new Error('Session not found');
      }

      console.log('📋 Restoring session with', session.windows.length, 'windows and', session.tabCount, 'tabs');

      // Restore each window
      for (const window of session.windows) {
        if (window.tabs.length === 0) continue;

        console.log('🪟 Creating window with', window.tabs.length, 'tabs');

        // Create window with tabs
        const newWindow = await chrome.windows.create({
          url: window.tabs.map(tab => tab.url),
          focused: window.focused,
          state: window.state,
        });

        console.log('✅ Created window:', newWindow.id);
      }

      return session;
    },
    onSuccess: (session) => {
      console.log('✅ Session restored successfully:', session.name);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error) => {
      console.error('❌ Failed to restore session:', error);
    },
  });
}