import React from 'react';

interface FilterControlsProps {
    filterByAutoSave: boolean | null;
    onFilterAutoSaveChange: (value: boolean | null) => void;
    selectedTags: string[];
    availableTags: string[];
    onToggleTag: (tag: string) => void;
}

export function FilterControls({
    filterByAutoSave,
    onFilterAutoSaveChange,
    selectedTags,
    availableTags,
    onToggleTag
}: FilterControlsProps) {
    return (
        <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <select
                    value={filterByAutoSave === null ? 'all' : filterByAutoSave ? 'auto' : 'manual'}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'all') onFilterAutoSaveChange(null);
                        else if (val === 'auto') onFilterAutoSaveChange(true);
                        else onFilterAutoSaveChange(false);
                    }}
                    className="bg-gray-100 dark:bg-gray-800 border-none rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Sessions</option>
                    <option value="auto">Auto-saved</option>
                    <option value="manual">Manual</option>
                </select>
            </div>

            {availableTags.length > 0 && (
                <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => onToggleTag(tag)}
                                className={`px-2 py-0.5 rounded transition-colors ${selectedTags.includes(tag)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
