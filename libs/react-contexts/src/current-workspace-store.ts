import { create } from 'zustand';

export type WorkspaceInfo = {
  id?: string;
  isPremium: boolean;
};

interface CurrentWorkspaceStore {
  workspaceInfo: WorkspaceInfo;
  setCurrentWorkspaceInfo: (v: WorkspaceInfo) => void;
}

export const useCurrentWorkspaceStore = create<CurrentWorkspaceStore>(
  (set) => ({
    workspaceInfo: {
      id: undefined,
      isPremium: false,
    },
    setCurrentWorkspaceInfo: (wsi: WorkspaceInfo) =>
      set(() => ({ workspaceInfo: wsi })),
  })
);
