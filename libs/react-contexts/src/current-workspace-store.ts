import { create } from 'zustand';

export type WorkspaceInfo = {
  id?: string;
  isPremium: boolean;
  quotaLimit?: number;
  queryCount?: number;
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
      quotaLimit: 0,
      queryCount: 0,
    },
    setCurrentWorkspaceInfo: (wsi: WorkspaceInfo) =>
      set(() => ({ workspaceInfo: wsi })),
  })
);
