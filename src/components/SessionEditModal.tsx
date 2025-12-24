import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import type { Session, SessionTab } from '../types/session';
import { useAIGeneration } from '../hooks/useAI';

interface SessionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, updates: { name: string; summary?: string; tags: string[] }) => void;
    session: Session | null;
}

// Sparkle icon for AI generation buttons
function SparkleIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
}

// Loading spinner component
function Spinner({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}

export function SessionEditModal({ isOpen, onClose, onSave, session }: SessionEditModalProps) {
    const [name, setName] = useState('');
    const [summary, setSummary] = useState('');
    const [tagsString, setTagsString] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { generateName, generateSummary, generateTags, isGenerating } = useAIGeneration();

    // Extract all tabs from session for AI generation
    const allTabs = useMemo((): SessionTab[] => {
        if (!session) return [];
        return session.windows.flatMap(window => window.tabs);
    }, [session]);

    useEffect(() => {
        if (session) {
            setName(session.name);
            setSummary(session.summary || '');
            setTagsString(session.tags.join(', '));
            setError(null);
        }
    }, [session]);

    const handleGenerateName = async () => {
        if (allTabs.length === 0) {
            setError('No tabs available to analyze');
            return;
        }
        setError(null);
        try {
            const result = await generateName.mutateAsync(allTabs);
            if (result.success && result.name) {
                setName(result.name);
            } else {
                setError(result.error || 'Failed to generate name');
            }
        } catch (err) {
            setError('AI generation failed. Please try again.');
        }
    };

    const handleGenerateSummary = async () => {
        if (allTabs.length === 0) {
            setError('No tabs available to analyze');
            return;
        }
        setError(null);
        try {
            const result = await generateSummary.mutateAsync(allTabs);
            if (result.success && result.summary) {
                setSummary(result.summary);
            } else {
                setError(result.error || 'Failed to generate summary');
            }
        } catch (err) {
            setError('AI generation failed. Please try again.');
        }
    };

    const handleGenerateTags = async () => {
        if (allTabs.length === 0) {
            setError('No tabs available to analyze');
            return;
        }
        setError(null);
        try {
            const result = await generateTags.mutateAsync(allTabs);
            if (result.success && result.tags) {
                const existingTags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
                const mergedTags = [...new Set([...existingTags, ...result.tags])];
                setTagsString(mergedTags.join(', '));
            } else {
                setError(result.error || 'Failed to generate tags');
            }
        } catch (err) {
            setError('AI generation failed. Please try again.');
        }
    };

    const handleGenerateAll = async () => {
        if (allTabs.length === 0) {
            setError('No tabs available to analyze');
            return;
        }
        setError(null);
        try {
            // Run all three in parallel
            const [nameResult, summaryResult, tagsResult] = await Promise.all([
                generateName.mutateAsync(allTabs),
                generateSummary.mutateAsync(allTabs),
                generateTags.mutateAsync(allTabs)
            ]);

            if (nameResult.success && nameResult.name) {
                setName(nameResult.name);
            }
            if (summaryResult.success && summaryResult.summary) {
                setSummary(summaryResult.summary);
            }
            if (tagsResult.success && tagsResult.tags) {
                const existingTags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
                const mergedTags = [...new Set([...existingTags, ...tagsResult.tags])];
                setTagsString(mergedTags.join(', '));
            }

            // Check for any failures
            const failures = [];
            if (!nameResult.success) failures.push('name');
            if (!summaryResult.success) failures.push('summary');
            if (!tagsResult.success) failures.push('tags');

            if (failures.length > 0) {
                setError(`Failed to generate: ${failures.join(', ')}`);
            }
        } catch (err) {
            setError('AI generation failed. Please try again.');
        }
    };

    const handleSave = () => {
        if (!session) return;

        const tags = tagsString
            .split(',')
            .map(t => t.trim())
            .filter(t => t !== '');

        onSave(session.id, {
            name,
            summary: summary || undefined,
            tags
        });
        onClose();
    };

    const footer = (
        <>
            <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={!name.trim() || isGenerating}
            >
                Save Changes
            </button>
            <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto transition-colors"
                onClick={onClose}
            >
                Cancel
            </button>
        </>
    );

    // AI generate button component for reusability
    const AIGenerateButton = ({ onClick, isLoading, title }: { onClick: () => void; isLoading: boolean; title: string }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading || allTabs.length === 0}
            className="inline-flex items-center justify-center p-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={title}
        >
            {isLoading ? <Spinner className="w-4 h-4" /> : <SparkleIcon className="w-4 h-4" />}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Session" footer={footer}>
            <div className="space-y-4">
                {/* Error message */}
                {error && (
                    <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                {/* Generate All button */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleGenerateAll}
                        disabled={isGenerating || allTabs.length === 0}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-purple-200 dark:border-purple-800"
                    >
                        {isGenerating ? <Spinner className="w-4 h-4" /> : <SparkleIcon className="w-4 h-4" />}
                        <span>Generate All with AI</span>
                    </button>
                </div>

                {/* Session Name */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="session-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Session Name
                        </label>
                        <AIGenerateButton
                            onClick={handleGenerateName}
                            isLoading={generateName.isPending}
                            title="Generate name with AI"
                        />
                    </div>
                    <input
                        type="text"
                        id="session-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 sm:text-sm"
                        placeholder="Enter session name"
                    />
                </div>

                {/* Summary */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="session-summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Summary (optional)
                        </label>
                        <AIGenerateButton
                            onClick={handleGenerateSummary}
                            isLoading={generateSummary.isPending}
                            title="Generate summary with AI"
                        />
                    </div>
                    <textarea
                        id="session-summary"
                        rows={3}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 sm:text-sm"
                        placeholder="A brief description of this session"
                    />
                </div>

                {/* Tags */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="session-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tags (comma separated)
                        </label>
                        <AIGenerateButton
                            onClick={handleGenerateTags}
                            isLoading={generateTags.isPending}
                            title="Generate tags with AI"
                        />
                    </div>
                    <input
                        type="text"
                        id="session-tags"
                        value={tagsString}
                        onChange={(e) => setTagsString(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 sm:text-sm"
                        placeholder="work, research, project-x"
                    />
                </div>

                {/* AI Info */}
                {allTabs.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        ✨ AI will analyze {allTabs.length} tabs to generate suggestions
                    </p>
                )}
            </div>
        </Modal>
    );
}
