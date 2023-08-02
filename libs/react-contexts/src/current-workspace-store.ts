import { create } from 'zustand';

const WARNING_CREDITS_USAGE_PERCENTAGE = 0.75;

export type WorkspaceInfo = {
  id?: string;
  isPremium: boolean;
  quotaLimit?: number;
  queryCount?: number;
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
      quotaLimit: 0,
      queryCount: 0,
    },
    isQuotaLimitBeingReached: false,
    nrQueriesLeft: 0,
    setCurrentWorkspaceInfo: (wsi: WorkspaceInfo) =>
      set(() => {
        const { queryCount, quotaLimit } = wsi;
        const nrQueriesLeft =
          quotaLimit && queryCount ? quotaLimit - queryCount : 0;
        const isQuotaLimitBeingReached =
          quotaLimit && queryCount
            ? queryCount >= quotaLimit * WARNING_CREDITS_USAGE_PERCENTAGE &&
              quotaLimit - queryCount > 0
            : false;

        return {
          workspaceInfo: wsi,
          nrQueriesLeft,
          isQuotaLimitBeingReached,
        };
      }),
  })
);
