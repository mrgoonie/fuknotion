// Note service that communicates with the Wails backend
// These functions will be bound when Wails generates the bindings

import type { Note } from '../types';

// Temporary placeholder functions that will be replaced by Wails bindings
// In production, these will import from '../wailsjs/go/app/App'

export async function createNote(
  title: string,
  content: string,
  folderID: string = ''
): Promise<Note> {
  // This will be replaced by: import { CreateNote } from '../wailsjs/go/app/App'
  // For now, create a mock implementation
  const note: Note = {
    id: `note_${Date.now()}`,
    title,
    content,
    folderId: folderID,
    filePath: `notes/note_${Date.now()}.md`,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  console.log('createNote called (mock):', note);
  return note;
}

export async function getNote(id: string): Promise<Note> {
  // This will be replaced by: import { GetNote } from '../wailsjs/go/app/App'
  console.log('getNote called (mock):', id);
  const note: Note = {
    id,
    title: 'Sample Note',
    content: '# Sample Note\n\nThis is sample content.',
    folderId: '',
    filePath: `notes/${id}.md`,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return note;
}

export async function updateNote(
  id: string,
  title: string,
  content: string
): Promise<void> {
  // This will be replaced by: import { UpdateNote } from '../wailsjs/go/app/App'
  console.log('updateNote called (mock):', { id, title, content: content.substring(0, 50) + '...' });
}

export async function deleteNote(id: string): Promise<void> {
  // This will be replaced by: import { DeleteNote } from '../wailsjs/go/app/App'
  console.log('deleteNote called (mock):', id);
}

export async function listNotes(): Promise<Note[]> {
  // This will be replaced by: import { ListNotes } from '../wailsjs/go/app/App'
  console.log('listNotes called (mock)');
  return [];
}
