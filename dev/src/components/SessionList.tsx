import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import type { Session } from '../types/session';
import { useDeleteSession, useRestoreSession, useUpdateSession } from '../hooks/useSessionMutations';
import { useExportSessions } from '../hooks/useImportExport';
import { downloadFile, generateExportFilename } from '../lib/download';
import { formatSmartDate, formatRelativeTime } from '../lib/datetime';
import { SearchBar } from './SearchBar';
import { FilterControls } from './FilterControls';
import { Dropdown } from './Dropdown';
import { ConfirmDialog } from './ConfirmDialog';
import { SessionEditModal } from './SessionEditModal';
import { SessionItemSkeleton } from './Skeleton';

interface SessionListProps {
  sessions: Session[];
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
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
  onEdit: (session: Session) => void;
}) => {
  const handleDeleteSession = useCallback(() => {
    onDelete(session.id);
  }, [session.id, onDelete]);

  const handleRestoreSession = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRestore(session.id);
  }, [session.id, onRestore]);

  const handleExportSession = useCallback(() => {
    onExport(session);
  }, [session, onExport]);

  const handleEditSession = useCallback(() => {
    onEdit(session);
  }, [session, onEdit]);

  const toggleExpanded = useCallback(() => {
    onToggle(session.id);
  }, [session.id, onToggle]);

  // Actions for the dropdown
  const dropdownItems = useMemo(() => [
    {
      label: isExpanded ? 'Show Less' : 'Show Details',
      onClick: toggleExpanded,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      )
    },
    {
      label: 'Edit Details',
      onClick: handleEditSession,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      label: 'Export Session',
      onClick: handleExportSession,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      variant: 'success' as const
    },
    {
      label: 'Delete Session',
      onClick: handleDeleteSession,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      variant: 'danger' as const
    }
  ], [isExpanded, toggleExpanded, handleEditSession, handleExportSession, handleDeleteSession]);

  // Memoize formatted date to avoid recalculating on every render
  const formattedDate = useMemo(() => {
    return formatSmartDate(session.createdAt);
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
            onClick={handleRestoreSession}
            className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Restore
          </button>

          <Dropdown
            trigger={
              <button
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Session actions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            }
            items={dropdownItems}
          />
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
  const updateSession = useUpdateSession();
  const exportSessions = useExportSessions();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // New filter states
  const [filterByAutoSave, setFilterByAutoSave] = useState<boolean | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Edit modal state
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Confirm dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'info'
  });

  // Get unique tags from all sessions
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    sessions.forEach(s => s.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [sessions]);

  // Memoize filtered sessions for search performance (using debounced query + other filters)
  const filteredSessions = useMemo(() => {
    let result = sessions;

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(session =>
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
    }

    // Filter by auto-save status
    if (filterByAutoSave !== null) {
      result = result.filter(s => !!s.isAutoSave === filterByAutoSave);
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      result = result.filter(s => selectedTags.every(t => s.tags.includes(t)));
    }

    return result;
  }, [sessions, debouncedSearchQuery, filterByAutoSave, selectedTags]);

  // Memoize session handlers to prevent recreating functions
  const handleToggleExpanded = useCallback((sessionId: string) => {
    setExpandedSession(prev => prev === sessionId ? null : sessionId);
  }, []);

  const handleDeleteSession = useCallback((sessionId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session? This action cannot be undone.',
      variant: 'danger',
      onConfirm: () => deleteSession.mutate(sessionId)
    });
  }, [deleteSession]);

  const handleRestoreSession = useCallback((sessionId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Restore Session',
      message: 'Restore this session? This will open all saved tabs in a new window.',
      variant: 'info',
      onConfirm: () => {
        restoreSession.mutate(sessionId);
        onClose();
      }
    });
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

  const handleEditSession = useCallback((session: Session) => {
    setEditSession(session);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback((id: string, updates: any) => {
    updateSession.mutate({ id, updates });
  }, [updateSession]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
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
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 gap-3">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 rounded-lg p-1.5 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Saved Sessions
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totals.filteredSessions} of {totals.totalSessions} sessions filtered
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {sessions.length > 0 && (
              <button
                onClick={() => exportSessions.mutate()}
                disabled={exportSessions.isPending}
                className="px-4 py-2 text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all shadow-sm flex items-center space-x-2"
                title="Export all sessions to JSON file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{exportSessions.isPending ? 'Exporting...' : 'Export All'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Filters - only show if there are sessions */}
        {sessions.length > 0 && (
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 space-y-4 bg-white dark:bg-gray-900/50">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search sessions by name, tags, or content..."
            />
            <FilterControls
              filterByAutoSave={filterByAutoSave}
              onFilterAutoSaveChange={setFilterByAutoSave}
              availableTags={availableTags}
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
            />
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 bg-white dark:bg-gray-900">
          {isLoading ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, i) => (
                <SessionItemSkeleton key={i} />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
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
                  onEdit={handleEditSession}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 px-1">
            <div className="flex items-center space-x-3">
              <span>{totals.filteredTabs} Tabs</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span>{totals.filteredSessions} Sessions</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>Storage: local</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <SessionEditModal
        isOpen={isEditModalOpen}
        session={editSession}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </div >
  );
}