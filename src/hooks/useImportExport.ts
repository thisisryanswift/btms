import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImportExportService } from '../services/ImportExportService';

// Query keys for React Query
export const IMPORT_EXPORT_QUERY_KEY = ['import-export'] as const;

// Read hooks
export function useImportExportStats() {
  return useQuery({
    queryKey: [...IMPORT_EXPORT_QUERY_KEY, 'stats'],
    queryFn: () => ImportExportService.getInstance().getStatistics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Write hooks
export function useExportSessions() {
  return useMutation({
    mutationFn: () => ImportExportService.getInstance().exportSessions(),
    onSuccess: (jsonString) => {
      // Create and download file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `btms-sessions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Sessions exported successfully');
    },
    onError: (error: Error) => {
      console.error('❌ Failed to export sessions:', error);
    },
  });
}

export function useImportSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jsonString: string) => 
      ImportExportService.getInstance().importSessions(jsonString),
    onSuccess: (result) => {
      // Invalidate session queries
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: IMPORT_EXPORT_QUERY_KEY });
      
      console.log(`✅ Import completed: ${result.imported} sessions imported`);
      
      return result;
    },
    onError: (error: Error) => {
      console.error('❌ Failed to import sessions:', error);
    },
  });
}

export function useImportSingleSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jsonString, sessionId }: { jsonString: string; sessionId: string }) =>
      ImportExportService.getInstance().importSingleSession(jsonString, sessionId),
    onSuccess: (session) => {
      // Invalidate session queries
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: IMPORT_EXPORT_QUERY_KEY });
      
      console.log(`✅ Single session imported: ${session.name}`);
      
      return session;
    },
    onError: (error: Error) => {
      console.error('❌ Failed to import single session:', error);
    },
  });
}