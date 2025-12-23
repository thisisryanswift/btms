import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Session } from '../types/session';

interface SessionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, updates: { name: string; summary?: string; tags: string[] }) => void;
    session: Session | null;
}

export function SessionEditModal({ isOpen, onClose, onSave, session }: SessionEditModalProps) {
    const [name, setName] = useState('');
    const [summary, setSummary] = useState('');
    const [tagsString, setTagsString] = useState('');

    useEffect(() => {
        if (session) {
            setName(session.name);
            setSummary(session.summary || '');
            setTagsString(session.tags.join(', '));
        }
    }, [session]);

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
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto transition-colors"
                onClick={handleSave}
                disabled={!name.trim()}
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Session" footer={footer}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="session-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Session Name
                    </label>
                    <input
                        type="text"
                        id="session-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 sm:text-sm"
                        placeholder="Enter session name"
                    />
                </div>

                <div>
                    <label htmlFor="session-summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Summary (optional)
                    </label>
                    <textarea
                        id="session-summary"
                        rows={3}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 sm:text-sm"
                        placeholder="A brief description of this session"
                    />
                </div>

                <div>
                    <label htmlFor="session-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        id="session-tags"
                        value={tagsString}
                        onChange={(e) => setTagsString(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 sm:text-sm"
                        placeholder="work, research, project-x"
                    />
                </div>
            </div>
        </Modal>
    );
}
