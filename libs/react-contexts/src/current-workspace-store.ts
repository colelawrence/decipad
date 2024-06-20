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
  isUpgradeWorkspaceModalOpen?: boolean;
  setIsUpgradeWorkspaceModalOpen: (isOpen: boolean) => void;
}

export const useCurrentWorkspaceStore = create<CurrentWorkspaceStore>(
  (set) => ({
    workspaceInfo: {
      id: undefined,
      isPremium: false,
      plan: 'free',
    },
    isUpgradeWorkspaceModalOpen: false,
    setIsUpgradeWorkspaceModalOpen: (isModalOpen: boolean) =>
      set(() => ({
        isUpgradeWorkspaceModalOpen: isModalOpen,
      })),
    setCurrentWorkspaceInfo: (wsi: WorkspaceInfo) =>
      set(() => {
        return {
          workspaceInfo: wsi,
        };
      }),
  })
);
