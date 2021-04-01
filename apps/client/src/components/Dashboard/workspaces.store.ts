import produce from 'immer';
import create from 'zustand';
import { persist } from 'zustand/middleware';

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
  set: (fn: (state: Store) => void) => void;
};

export const useWorkspaces = create<Store>(
  persist(
    (set) => ({
      workspaces: [],
      set: (fn: (state: Store) => void) => set(produce(fn)),
    }),
    { name: 'workspaces' }
  )
);
