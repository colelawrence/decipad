import produce from 'immer';
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
};

export const useWorkspaces = create<Store>((set) => ({
  workspaces: [],
  set: (fn: (state: Store) => void) => set(produce(fn)),
}));
