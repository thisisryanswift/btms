import React, { useState } from 'react';
import { useSessions, useSessionStats } from '../hooks/useSession';
import { useCaptureCurrentSession } from '../hooks/useSessionMutations';
import { SessionList } from './SessionList';

export function Popup() {
  const [useAINaming, setUseAINaming] = useState(true);
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);

  // TanStack Query hooks
  const sessionsQuery = useSessions();
  const statsQuery = useSessionStats();
  const captureSession = useCaptureCurrentSession();

  const handleSaveSession = () => {
    console.log('Save button clicked');
    captureSession.mutate({
      name: undefined,
      autoSave: false,
      activeOnly: false,
      useAINaming: useAINaming
    });
  };

  const handleViewSessions = () => {
    setIsSessionListOpen(true);
  };

  const handleCloseSessionList = () => {
    setIsSessionListOpen(false);
  };

  return (
    <div className="min-w-[400px] min-h-[500px] p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="space-y-4">
        <header className="flex justify-between items-center border-b pb-2">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              BTMS
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => chrome.runtime.openOptionsPage()}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Better Tab Management System
              </div>
              {statsQuery.data && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {statsQuery.data.count} sessions • {statsQuery.data.totalTabs} tabs
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="space-y-4">


          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  AI-powered session management
                </p>
                <label className="flex items-center space-x-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={useAINaming}
                    onChange={(e) => setUseAINaming(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Use AI for session naming
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSaveSession}
              disabled={captureSession.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {captureSession.isPending ? (
                <>
                  <svg className=" animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                  <span>Save Current Session</span>
                </>
              )}
            </button>
            <button
              onClick={handleViewSessions}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>View Saved Sessions ({sessionsQuery.data?.length || 0})</span>
            </button>
          </div>

          {captureSession.isError && (
            <div className="text-center text-red-600 dark:text-red-400 text-sm">
              Failed to save: {captureSession.error?.message || 'Unknown error'}
            </div>
          )}

          {captureSession.isSuccess && (
            <div className="text-center text-green-600 dark:text-green-400 text-sm">
              ✅ Session saved successfully!
            </div>
          )}

          {sessionsQuery.data && sessionsQuery.data.length === 0 && !sessionsQuery.isLoading && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
              No sessions saved yet. Create your first session!
            </div>
          )}
        </main>
      </div>

      {/* Session List Modal */}
      <SessionList
        sessions={sessionsQuery.data || []}
        isOpen={isSessionListOpen}
        onClose={handleCloseSessionList}
        isLoading={sessionsQuery.isLoading}
      />
    </div>
  );
}