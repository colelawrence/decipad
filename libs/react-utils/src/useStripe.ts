import type { SubPlansFragment } from '@decipad/graphql-client';
import { useGetSubscriptionsPlansQuery } from '@decipad/graphql-client';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useMemo } from 'react';

/* istanbul ignore file */
type NotebookAvatarTrait = {
  user?: { id: string } | null;
  permission: string;
};

type WorkspaceData = {
  workspaceSubscription?: {
    readers?: number | null;
    editors?: number | null;
  } | null;
  access?: {
    users?: NotebookAvatarTrait[] | null;
  } | null;
};

const MAX_NOTEBOOK_COLLABORATORS = 3;

export type UseStripePlansReturn = SubPlansFragment & {
  price: number;
  description: string;
};

export const useStripePlans = (): Array<UseStripePlansReturn> => {
  const [subscriptionPlans] = useGetSubscriptionsPlansQuery();

  const plans = useMemo(() => {
    return subscriptionPlans.data?.getSubscriptionsPlans ?? [];
  }, [subscriptionPlans]);

  // return only free + correct plan based on feature flag
  const availablePlans = useMemo(
    () =>
      plans.filter((plan) => {
        return (
          (isFlagEnabled('NEW_PAYMENTS')
            ? !plan?.isDefault
            : plan?.isDefault) || plan?.key === 'free'
        );
      }),
    [plans]
  );

  const linkedPlans = useMemo(() => {
    return availablePlans.map((plan) => {
      if (plan) {
        return {
          ...plan,
          price: plan.price ?? 0,
          // special case for free plan (should I put this here?)
          description: plan.description ?? '',
        };
      }
      return null;
    });
  }, [availablePlans]);

  const sortedPlans = useMemo(() => {
    return linkedPlans
      .sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0))
      .filter((plan): plan is UseStripePlansReturn => plan != null);
  }, [linkedPlans]);

  return sortedPlans;
};

export const useStripeCollaborationRules = (
  workspace?: WorkspaceData | null,
  usersWithAccess: NotebookAvatarTrait[] = []
) => {
  const usersFromTeam: NotebookAvatarTrait[] = workspace?.access?.users || [];
  const teamExcludingAdmins = usersFromTeam.filter(
    (member) => member.permission !== 'ADMIN'
  );

  const maxCollabReaders = workspace?.workspaceSubscription?.readers || 0;
  const maxCollabEditors = workspace?.workspaceSubscription?.editors || 0;

  const editorsWithAccess = usersWithAccess.filter(
    (user) => user.permission === 'WRITE'
  );

  const readersWithAccess = usersWithAccess.filter(
    (user) => user.permission === 'READ'
  );

  if (isFlagEnabled('NEW_PAYMENTS')) {
    let canInviteReaders = true;
    let canInviteEditors = true;

    // According to requirements, the admin is also considered an editor
    if (editorsWithAccess.length >= maxCollabEditors - 1) {
      canInviteEditors = false;
    }

    if (readersWithAccess.length >= maxCollabReaders) {
      canInviteReaders = false;
    }

    return {
      canInviteReaders,
      canInviteEditors,
      canRemove: true,
    };
  }

  if (teamExcludingAdmins.length > 0) {
    return {
      canInvite: true,
      canRemove: true,
    };
  }

  if (usersWithAccess.length >= MAX_NOTEBOOK_COLLABORATORS) {
    return {
      canInvite: false,
      canRemove: true,
    };
  }

  return {
    canInvite: true,
    canRemove: true,
  };
};
