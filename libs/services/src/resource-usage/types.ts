export interface WithReset {
  reset: (workspaceId: string) => Promise<void>;
}

export interface WithExtraCredits {
  getRemainingExtraCredits: (workspaceId: string) => Promise<number>;
}

export interface ResourceTracker {
  getUsage: (workspaceId: string) => Promise<number>;

  getLimit: (workspaceId: string) => Promise<number>;
  hasReachedLimit: (workspaceId: string) => Promise<boolean>;
}

export interface ResourceTrackerInserter<TFields extends string, TUsage>
  extends ResourceTracker {
  upsert: (
    workspaceId: string,
    field: TFields,
    consumption: number
  ) => Promise<void>;

  updateWorkspaceAndUser: (props: {
    workspaceId?: string;
    userId?: string;
    padId?: string;
    usage?: TUsage;
  }) => Promise<void>;
}

export type ResourceTrackerInserterWithReset<
  TFields extends string,
  TUsage
> = ResourceTrackerInserter<TFields, TUsage> & WithReset;

export type ResourceTrackerInserterWithCreditsAndReset<
  TFields extends string,
  TUsage
> = ResourceTrackerInserterWithReset<TFields, TUsage> & WithExtraCredits;
