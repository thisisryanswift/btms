import React, { useState, useMemo, useCallback, memo } from 'react';
import type { Session } from '../types/session';
import { useDeleteSession, useRestoreSession } from '../hooks/useSessionMutations';
import { useExportSessions } from '../hooks/useImportExport';
import { downloadFile, generateExportFilename } from '../lib/download';

interface SessionListProps {
  sessions: Session[];
  isOpen: boolean;
  onClose: () => void;
}

// Memoized session item component to prevent unnecessary re-renders
const SessionItem = memo(({
  session,
  isExpanded,
  onToggle,
  onRestore,
  onDelete,
  onExport
}: {
  session: Session;
  isExpanded: boolean;
  onToggle: (sessionId: string) => void;
  onRestore: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onExport: (session: Session) => void;
}) => {
  const handleDeleteSession = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
      onDelete(session.id);
    }
  }, [session.id, onDelete]);

  const handleRestoreSession = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Restore this session? This will open all saved tabs.')) {
      onRestore(session.id);
    }
  }, [session.id, onRestore]);

  const handleExportSession = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onExport(session);
  }, [session, onExport]);

  const toggleExpanded = useCallback(() => {
    onToggle(session.id);
  }, [session.id, onToggle]);

  // Memoize formatted date to avoid recalculating on every render
  const formattedDate = useMemo(() => {
    return new Date(session.createdAt).toLocaleString();
  }, [session.createdAt]);

  // Memoize tab list rendering for expanded view
  const expandedContent = useMemo(() => {
    if (!isExpanded) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Windows & Tabs ({session.windows.length} windows)
        </h4>
        <div className="space-y-2">
          {session.windows.map((window, windowIndex) => (
            <div key={window.id} className="text-xs">
              <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">
                Window {windowIndex + 1} ({window.tabs.length} tabs)
              </div>
              <div className="space-y-1 pl-4">
                {window.tabs.slice(0, 5).map((tab, tabIndex) => (
                  <div key={`${window.id}-${tabIndex}`} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 truncate">
                    {tab.favicon && (
                      <img
                        src={tab.favicon}
                        alt=""
                        className="w-3 h-3 flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    <span className="truncate">{tab.title}</span>
                  </div>
                ))}
                {window.tabs.length > 5 && (
                  <div className="text-gray-400 pl-5">
                    ... and {window.tabs.length - 5} more tabs
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [isExpanded, session.windows]);

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="flex items-start justify-between">
        {/* Session Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {session.name}
          </h3>
          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{formattedDate}</span>
            <span>{session.tabCount} tabs</span>
            <span>{session.windowCount} windows</span>
            {session.isAutoSave && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Auto-saved
              </span>
            )}
          </div>

          {/* Tags - memoized */}
          {session.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {session.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {session.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{session.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Summary */}
          {session.summary && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {session.summary}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={toggleExpanded}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
          <button
            onClick={handleRestoreSession}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Restore
          </button>
          <button
            onClick={handleExportSession}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            title="Export session to JSON file"
          >
            📤 Export
          </button>
          <button
            onClick={handleDeleteSession}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {expandedContent}
    </div>
  );
});

SessionItem.displayName = 'SessionItem';

export function SessionList({ sessions, isOpen, onClose }: SessionListProps) {
  const deleteSession = useDeleteSession();
  const restoreSession = useRestoreSession();
  const exportSessions = useExportSessions();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize filtered sessions for search performance
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;

    const query = searchQuery.toLowerCase();
    return sessions.filter(session =>
      session.name.toLowerCase().includes(query) ||
      session.summary?.toLowerCase().includes(query) ||
      session.tags.some(tag => tag.toLowerCase().includes(query)) ||
      session.windows.some(window =>
        window.tabs.some(tab =>
          tab.title.toLowerCase().includes(query) ||
          tab.url.toLowerCase().includes(query)
        )
      )
    );
  }, [sessions, searchQuery]);

  // Memoize session handlers to prevent recreating functions
  const handleToggleExpanded = useCallback((sessionId: string) => {
    setExpandedSession(prev => prev === sessionId ? null : sessionId);
  }, []);

  const handleDeleteSession = useCallback((sessionId: string) => {
    deleteSession.mutate(sessionId);
  }, [deleteSession]);

  const handleRestoreSession = useCallback((sessionId: string) => {
    restoreSession.mutate(sessionId);
    onClose();
  }, [restoreSession, onClose]);

  const handleExportSession = useCallback((session: Session) => {
    // Create export data with just this session
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      totalSessions: 1,
      sessions: [session]
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    // Use shared download utility
    downloadFile({
      content: jsonString,
      filename: generateExportFilename(session.name),
      mimeType: 'application/json'
    });
  }, []);

  // Memoize total counts to avoid recalculation
  const totals = useMemo(() => ({
    totalTabs: sessions.reduce((sum, s) => sum + s.tabCount, 0),
    totalSessions: sessions.length,
    filteredTabs: filteredSessions.reduce((sum, s) => sum + s.tabCount, 0),
    filteredSessions: filteredSessions.length
  }), [sessions, filteredSessions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Saved Sessions {totals.filteredSessions !== totals.totalSessions && `(${totals.filteredSessions}/${totals.totalSessions})`}
            </h2>
            {sessions.length > 0 && (
              <button
                onClick={() => exportSessions.mutate()}
                disabled={exportSessions.isPending}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
                title="Export all sessions to JSON file"
              >
                {exportSessions.isPending ? 'Exporting...' : '📤 Export All'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search bar - only show if there are sessions */}
        {sessions.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sessions by name, summary, tags, or tab content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>
                {sessions.length === 0
                  ? "No saved sessions yet"
                  : searchQuery
                    ? "No sessions match your search"
                    : "No saved sessions yet"
                }
              </p>
              <p className="text-sm mt-2">
                {sessions.length === 0
                  ? "Start by saving your current browser session!"
                  : "Try a different search term"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:border-gray-700">
              {filteredSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isExpanded={expandedSession === session.id}
                  onToggle={handleToggleExpanded}
                  onRestore={handleRestoreSession}
                  onDelete={handleDeleteSession}
                  onExport={handleExportSession}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {totals.filteredTabs} tabs across {totals.filteredSessions} sessions
              {totals.filteredSessions !== totals.totalSessions && ` (filtered from ${totals.totalSessions})`}
            </span>
            <span>Storage: chrome.storage.local</span>
          </div>
        </div>
      </div>
    </div>
  );
}