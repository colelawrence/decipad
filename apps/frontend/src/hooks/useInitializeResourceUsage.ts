import { Workspace } from '@decipad/graphql-client';
import { useResourceUsage } from '@decipad/react-contexts';
import { useCallback, useEffect } from 'react';

type WorkspaceWithSubscriptionAndResource = Pick<
  Workspace,
  'workspaceSubscription' | 'resourceUsages' | 'id'
>;

let previousWorkspaceRef: undefined | string;

/**
 * Research into hooks similar to zustand, where you can choose the reactivity you want.
 */
export const useInitializeResourceUsage = (
  workspace: WorkspaceWithSubscriptionAndResource | undefined | null
): void => {
  const { ai, queries } = useResourceUsage();

  const initializeState = useCallback(
    (_workspace: WorkspaceWithSubscriptionAndResource) => {
      if (_workspace == null || _workspace.workspaceSubscription == null) {
        return;
      }

      const queryLimit = _workspace.workspaceSubscription.queries;
      const queryUsage =
        _workspace.resourceUsages?.find((r) => r?.resourceType === 'queries')
          ?.consumption ?? 0;

      queries.updateUsage({ usage: queryUsage, quotaLimit: queryLimit });

      const aiLimit = _workspace.workspaceSubscription.credits;
      const aiUsage =
        _workspace.resourceUsages?.find((r) => r?.resourceType === 'openai')
          ?.consumption ?? 0;

      ai.updateUsage({ usage: aiUsage, quotaLimit: aiLimit });
    },
    [ai, queries]
  );

  //
  // Because we suffer from a disconnect between GraphQL state and resource state.
  // We must do some funny things.
  //
  // We want this component to NOT re-initialize when going from workspace <-> notebook
  // But we do want it to re-initialize when going between workspace <-> workspace.
  //

  useEffect(() => {
    if (!workspace || workspace.id === previousWorkspaceRef) return;

    previousWorkspaceRef = workspace.id;

    initializeState(workspace);
  }, [workspace, initializeState]);
};
