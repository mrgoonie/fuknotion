export interface Note {
  id: string
  workspaceId: string
  title: string
  content: string
  parentId?: string
  isFavorite: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface Workspace {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: string
  workspaceId: string
  email: string
  name?: string
  role: "owner" | "admin" | "editor" | "viewer"
  createdAt: string
}

export interface Tab {
  id: string
  noteId: string
  title: string
}

export interface Theme {
  mode: "light" | "dark" | "system"
}
