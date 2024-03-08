import { useGetSubscriptionsPlansQuery } from '@decipad/graphql-client';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useMemo } from 'react';

/* istanbul ignore file */
type NotebookAvatarTrait = {
  user?: { id: string } | null;
  permission: string;
};

const MAX_NOTEBOOK_COLLABORATORS = 3;

export const useStripePlans = () => {
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
    return linkedPlans.sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0));
  }, [linkedPlans]);

  return sortedPlans;
};

export const useStripeCollaborationRules = (
  usersWithAccess: NotebookAvatarTrait[] = [],
  usersFromTeam: NotebookAvatarTrait[] = []
) => {
  const teamExcludingAdmins = usersFromTeam.filter(
    (member) => member.permission !== 'ADMIN'
  );

  if (isFlagEnabled('NEW_PAYMENTS')) {
    return {
      canInvite: true,
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
