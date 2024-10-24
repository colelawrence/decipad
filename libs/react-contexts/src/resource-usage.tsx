/* eslint-disable no-param-reassign */
import { dequal } from '@decipad/utils';
import type { FC, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type ResourceUsageActions = {
  updateUsage: (usage: Partial<SingleResourceUsage>) => void;
  incrementUsage: () => void;
  incrementUsageBy: (_: number) => void;
  increaseQuotaLimit: (quotaLimit: number) => void;
};

export type SingleResourceUsage = {
  usage: number;
  quotaLimit: number;

  hasReachedLimit: boolean;
  isNearLimit: boolean;
};

type TrackedResources = 'ai' | 'queries' | 'storage';

type ResourceUsages = Record<TrackedResources, SingleResourceUsage>;

type ResourceUsagesWithActions = Record<
  TrackedResources,
  SingleResourceUsage & ResourceUsageActions
>;

const NEAR_THRESHHOLD = 0.75;

const defaultContextValue: ResourceUsagesWithActions = {
  queries: {
    usage: 0,
    quotaLimit: 0,
    hasReachedLimit: false,
    isNearLimit: false,

    updateUsage: () => {},
    incrementUsage: () => {},
    incrementUsageBy: () => {},
    increaseQuotaLimit: () => {},
  },

  ai: {
    usage: 0,
    quotaLimit: 0,
    hasReachedLimit: false,
    isNearLimit: false,

    updateUsage: () => {},
    incrementUsage: () => {},
    incrementUsageBy: () => {},
    increaseQuotaLimit: () => {},
  },

  storage: {
    usage: 0,
    quotaLimit: 0,
    hasReachedLimit: false,
    isNearLimit: false,

    updateUsage: () => {},
    incrementUsage: () => {},
    incrementUsageBy: () => {},
    increaseQuotaLimit: () => {},
  },
};

const ResourceUsageContext =
  createContext<ResourceUsagesWithActions>(defaultContextValue);

function getMergedUsage(
  resource: TrackedResources,
  original: ResourceUsages,
  update: Partial<SingleResourceUsage>
) {
  const updatedUsage: ResourceUsages = { ...original };
  const resourceToUpdate: SingleResourceUsage = {
    ...updatedUsage[resource],
    ...update,
  };

  resourceToUpdate.hasReachedLimit =
    resourceToUpdate.usage >= resourceToUpdate.quotaLimit;

  resourceToUpdate.isNearLimit =
    resourceToUpdate.usage / resourceToUpdate.quotaLimit > NEAR_THRESHHOLD;

  updatedUsage[resource] = resourceToUpdate;

  if (dequal(original, updatedUsage)) {
    // if the state is the same,
    // We return the original value (same reference), so react doesn't update
    return original;
  }

  return updatedUsage;
}

export const ResourceUsageProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [resourceUsage, setResourceUsage] =
    useState<ResourceUsages>(defaultContextValue);

  const updateUsage = useCallback<
    (_: TrackedResources) => ResourceUsageActions['updateUsage']
  >(
    (resource) => (usage) =>
      setResourceUsage((currentUsage) =>
        getMergedUsage(resource, currentUsage, usage)
      ),
    []
  );

  const increaseUsage = useCallback<
    (_: TrackedResources) => ResourceUsageActions['incrementUsage']
  >(
    (resource) => () =>
      setResourceUsage((currentUsage) =>
        getMergedUsage(resource, currentUsage, {
          usage: currentUsage[resource].usage + 1,
        })
      ),
    []
  );

  const incrementUsageBy = useCallback<
    (_: TrackedResources) => ResourceUsageActions['incrementUsageBy']
  >(
    (resource) => (amount) =>
      setResourceUsage((currentUsage) =>
        getMergedUsage(resource, currentUsage, {
          usage: currentUsage[resource].usage + amount,
        })
      ),
    []
  );

  const increaseQuotaLimit = useCallback<
    (_: TrackedResources) => ResourceUsageActions['increaseQuotaLimit']
  >(
    (resource) => (newQuotaLimit) =>
      setResourceUsage((currentUsage) =>
        getMergedUsage(resource, currentUsage, {
          quotaLimit: currentUsage[resource].quotaLimit + newQuotaLimit,
        })
      ),
    []
  );

  const resourceUsageWithActions = useMemo<ResourceUsagesWithActions>(
    () =>
      Object.entries(resourceUsage).reduce((p, [key, value]) => {
        const resource = key as TrackedResources;
        p[resource] = {
          ...value,

          updateUsage: updateUsage(resource),
          incrementUsage: increaseUsage(resource),
          incrementUsageBy: incrementUsageBy(resource),
          increaseQuotaLimit: increaseQuotaLimit(resource),
        };

        return p;
      }, {} as ResourceUsagesWithActions),
    [
      increaseQuotaLimit,
      increaseUsage,
      incrementUsageBy,
      resourceUsage,
      updateUsage,
    ]
  );

  return (
    <ResourceUsageContext.Provider value={resourceUsageWithActions}>
      {children}
    </ResourceUsageContext.Provider>
  );
};

export const useResourceUsage = () => useContext(ResourceUsageContext);
