import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import type { Session } from '../types/session';
import { formatSmartDate } from '../lib/datetime';
import { Dropdown } from './Dropdown';

export interface SessionItemProps {
    session: Session;
    isExpanded: boolean;
    onToggle: (sessionId: string) => void;
    onRestore: (sessionId: string) => void;
    onDelete: (sessionId: string) => void;
    onExport: (session: Session) => void;
    onEdit: (session: Session) => void;
}

// Memoized session item component to prevent unnecessary re-renders
export const SessionItem = memo(({
    session,
    isExpanded,
    onToggle,
    onRestore,
    onDelete,
    onExport,
    onEdit
}: SessionItemProps) => {
    const [expandedWindows, setExpandedWindows] = useState<Set<number>>(new Set());

    // Reset expanded windows when session is collapsed
    useEffect(() => {
        if (!isExpanded) {
            setExpandedWindows(new Set());
        }
    }, [isExpanded]);
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

        const MAX_VISIBLE_TABS = 5;

        return (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Windows & Tabs ({session.windows.length} windows)
                </h4>
                <div className="space-y-4">
                    {session.windows.map((window, windowIndex) => {
                        const isWindowExpanded = expandedWindows.has(windowIndex);
                        const visibleTabs = isWindowExpanded ? window.tabs : window.tabs.slice(0, MAX_VISIBLE_TABS);
                        const hiddenCount = window.tabs.length - MAX_VISIBLE_TABS;

                        return (
                            <div key={window.id} className="text-xs">
                                <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Window {windowIndex + 1} ({window.tabs.length} tabs)
                                </div>
                                <div className="space-y-1 pl-4">
                                    {visibleTabs.map((tab, tabIndex) => (
                                        <div key={`${window.id}-${tabIndex}`} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 truncate">
                                            {tab.favicon && (
                                                <img
                                                    src={tab.favicon}
                                                    alt=""
                                                    className="w-3.5 h-3.5 flex-shrink-0"
                                                    loading="lazy"
                                                />
                                            )}
                                            <span className="truncate">{tab.title}</span>
                                        </div>
                                    ))}

                                    {hiddenCount > 0 && (
                                        <div className="pl-5 pt-1">
                                            {!isWindowExpanded ? (
                                                <button
                                                    onClick={() => setExpandedWindows(prev => new Set([...prev, windowIndex]))}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                                                >
                                                    ... and {hiddenCount} more tabs
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setExpandedWindows(prev => {
                                                        const next = new Set(prev);
                                                        next.delete(windowIndex);
                                                        return next;
                                                    })}
                                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline transition-colors"
                                                >
                                                    Show less
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }, [isExpanded, session.windows, expandedWindows]);

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
