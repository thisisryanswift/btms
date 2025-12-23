import React, { useState } from 'react';
import type { Session } from '../types/session';
import { useDeleteSession, useRestoreSession } from '../hooks/useSessionMutations';

interface SessionListProps {
  sessions: Session[];
  isOpen: boolean;
  onClose: () => void;
}

export function SessionList({ sessions, isOpen, onClose }: SessionListProps) {
  const deleteSession = useDeleteSession();
  const restoreSession = useRestoreSession();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSession.mutate(sessionId);
    }
  };

  const handleRestoreSession = async (sessionId: string) => {
    if (confirm('Restore this session? This will open all saved tabs.')) {
      restoreSession.mutate(sessionId);
      onClose(); // Close modal after initiating restore
    }
  };

  const toggleExpanded = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Saved Sessions ({sessions.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No saved sessions yet</p>
              <p className="text-sm mt-2">Start by saving your current browser session!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-start justify-between">
                    {/* Session Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {session.name}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(session.createdAt)}</span>
                        <span>{session.tabCount} tabs</span>
                        <span>{session.windowCount} windows</span>
                        {session.isAutoSave && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Auto-saved
                          </span>
                        )}
                      </div>
                      
                      {/* Tags */}
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
                        onClick={() => toggleExpanded(session.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
                      >
                        {expandedSession === session.id ? 'Less' : 'More'}
                      </button>
                      <button
                        onClick={() => handleRestoreSession(session.id)}
                        disabled={restoreSession.isPending}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                      >
                        {restoreSession.isPending ? 'Restoring...' : 'Restore'}
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        disabled={deleteSession.isPending}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
                      >
                        {deleteSession.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedSession === session.id && (
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
                                    <img src={tab.favicon} alt="" className="w-3 h-3 flex-shrink-0" />
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
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total: {sessions.reduce((sum, s) => sum + s.tabCount, 0)} tabs across {sessions.length} sessions</span>
            <span>Storage: chrome.storage.local</span>
          </div>
        </div>
      </div>
    </div>
  );
}