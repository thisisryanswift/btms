/**
 * Utility function for downloading data as a file
 */

import { formatForFilename } from './datetime';

export interface DownloadOptions {
    /** File content (string or Blob) */
    content: string | Blob;
    /** Filename to save as */
    filename: string;
    /** MIME type for the file */
    mimeType?: string;
}

/**
 * Download content as a file
 * Handles Blob creation, URL management, and cleanup
 */
export function downloadFile(options: DownloadOptions): void {
    const { content, filename, mimeType = 'application/json' } = options;

    // Create blob from content
    const blob = typeof content === 'string'
        ? new Blob([content], { type: mimeType })
        : content;

    // Create download URL
    const url = URL.createObjectURL(blob);

    // Create and trigger download
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

/**
 * Generate a safe filename from a string
 * Replaces non-alphanumeric characters with underscores
 */
export function sanitizeFilename(name: string): string {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

/**
 * Generate a timestamped filename for session exports
 */
export function generateExportFilename(sessionName: string): string {
    const safeName = sanitizeFilename(sessionName);
    const date = formatForFilename().split('T')[0];
    return `btms-session-${safeName}-${date}.json`;
}
