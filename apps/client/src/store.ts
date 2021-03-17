import { v4 } from 'uuid';
import create from 'zustand';

export interface Notebook {
  id: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  notebooks: Notebook[];
}

type Store = {
  workspaces: Workspace[];
  getWorkspace: (id: string) => Workspace;
  addWorkspace: (name: string) => void;
  editWorkspaceName: (newName: string, id: string) => void;
  deleteWorkspace: (id: string) => void;
  addNotebook: (workspaceId: string, name: string) => void;
  notebooks: Notebook[];
  setNotebooks: (workspaceId: string) => void;
};

export const useStore = create<Store>((set, get) => ({
  workspaces: [],
  notebooks: [],
  setNotebooks: (workspaceId: string) =>
    set((prev) => ({
      ...prev,
      notebooks: prev.workspaces.find((w) => w.id === workspaceId).notebooks,
    })),
  getWorkspace: (id: string) => get().workspaces.find((w) => w.id === id),
  addWorkspace: (name: string) =>
    set((prev) => ({
      ...prev,
      workspaces: [...prev.workspaces, { id: v4(), name, notebooks: [] }],
    })),
  editWorkspaceName: (newName: string, id: string) =>
    set((prev) => ({
      ...prev,
      workspaces: prev.workspaces.map((w) =>
        w.id === id
          ? {
              ...w,
              name: newName,
            }
          : w
      ),
    })),
  deleteWorkspace: (id: string) =>
    set((prev) => ({
      ...prev,
      workspaces: prev.workspaces.filter((w) => w.id !== id),
    })),
  addNotebook: (workspaceId: string, name: string) =>
    set((prev) => ({
      ...prev,
      workspaces: prev.workspaces.map((w) =>
        w.id === workspaceId
          ? { ...w, notebooks: [...w.notebooks, { id: v4(), name }] }
          : w
      ),
    })),
}));
