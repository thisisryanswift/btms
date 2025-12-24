/**
 * Date and time formatting utilities for BTMS
 * Provides consistent date formatting across the application
 */

/**
 * Format a timestamp to a human-readable date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Format a timestamp to a human-readable time string
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Format a timestamp to a date and time string
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Format a timestamp to a relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  
  return 'Just now';
}

/**
 * Format a timestamp for file naming (ISO format, safe for filenames)
 */
export function formatForFilename(timestamp: number = Date.now()): string {
  return new Date(timestamp).toISOString().replace(/[:.]/g, '-');
}

/**
 * Format a timestamp to a short date format (MM/DD/YYYY)
 */
export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric', 
    year: 'numeric'
  });
}

/**
 * Format a timestamp to an ISO string with timezone
 */
export function formatISO(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Check if a timestamp is from today
 */
export function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  
  return today.toDateString() === date.toDateString();
}

/**
 * Check if a timestamp is from yesterday
 */
export function isYesterday(timestamp: number): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const date = new Date(timestamp);
  return yesterday.toDateString() === date.toDateString();
}

/**
 * Format timestamp with smart relative display (shows "Today", "Yesterday", or date)
 */
export function formatSmartDate(timestamp: number): string {
  if (isToday(timestamp)) {
    return `Today at ${formatTime(timestamp)}`;
  }
  
  if (isYesterday(timestamp)) {
    return `Yesterday at ${formatTime(timestamp)}`;
  }
  
  return formatDateTime(timestamp);
}

/**
 * Get the start of day timestamp for a given date
 */
export function getStartOfDay(timestamp: number = Date.now()): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get the start of week timestamp for a given date
 */
export function getStartOfWeek(timestamp: number = Date.now()): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get the start of month timestamp for a given date
 */
export function getStartOfMonth(timestamp: number = Date.now()): number {
  const date = new Date(timestamp);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}