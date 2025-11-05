// Core data types for Fuknotion

export interface Workspace {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppConfig {
  theme: Theme;
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
}
