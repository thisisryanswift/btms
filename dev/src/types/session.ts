interface Session {
  id: string;
  name: string;
  summary?: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  windows: SessionWindow[];
  tabCount: number;
  windowCount: number;
  isAutoSave: boolean;
  source: 'manual' | 'auto' | 'import';
}

interface SessionWindow {
  id: number;
  focused: boolean;
  incognito: boolean;
  state: 'normal' | 'minimized' | 'maximized' | 'fullscreen';
  tabs: SessionTab[];
}

interface SessionTab {
  id: number;
  index: number;
  url: string;
  title: string;
  favicon?: string;
  pinned: boolean;
  active: boolean;
  groupId?: number;
  groupColor?: string;
  groupTitle?: string;
}

interface SessionMetadata {
  id: string;
  size: number;
  compressionRatio?: number;
  checksum?: string;
}

export type { Session, SessionWindow, SessionTab, SessionMetadata };