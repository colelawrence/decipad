import { create } from 'zustand';

export type WorkspaceInfo = {
  id?: string;
  isPremium: boolean;
  plan?: string;
};

interface CurrentWorkspaceStore {
  workspaceInfo: WorkspaceInfo;
  setCurrentWorkspaceInfo: (v: WorkspaceInfo) => void;
  isQuotaLimitBeingReached?: boolean;
  nrQueriesLeft?: number;
}

export const useCurrentWorkspaceStore = create<CurrentWorkspaceStore>(
  (set) => ({
    workspaceInfo: {
      id: undefined,
      isPremium: false,
      plan: 'free',
    },
    setCurrentWorkspaceInfo: (wsi: WorkspaceInfo) =>
      set(() => {
        return {
          workspaceInfo: wsi,
        };
      }),
  })
);
