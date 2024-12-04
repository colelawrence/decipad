import { SubscriptionPlansNames } from '@decipad/graphql-client';
import { create } from 'zustand';

export type WorkspaceInfo = {
  id?: string;
  isPremium: boolean | null;
  plan?: SubscriptionPlansNames | null;
  name?: string;
  membersCount?: number;
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
      name: undefined,
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
