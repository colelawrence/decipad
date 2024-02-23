import { env } from '@decipad/utils';
import { useGetSubscriptionsPlansQuery } from '@decipad/graphql-client';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useMemo } from 'react';

/* istanbul ignore file */
type WorkspaceTrait = {
  id: string;
  isPremium?: boolean | null;
};

type NotebookAvatarTrait = {
  user?: { id: string } | null;
  permission: string;
};

const MAX_NOTEBOOK_COLLABORATORS = 3;
const STRIPE_PAYMENT_LINK = env.VITE_STRIPE_PAYMENT_LINK;
const STRIPE_CUSTOMER_PORTAL_LINK = env.VITE_STRIPE_CUSTOMER_PORTAL_LINK;

/**
 * @deprecated This hook deprecated in favor of useStripePlans
 */
export const useStripeLinks = (workspace: WorkspaceTrait) => {
  const paymentLink = `${STRIPE_PAYMENT_LINK}?client_reference_id=${workspace.id}`;
  return {
    paymentLink: !workspace.isPremium ? paymentLink : undefined,
    customerPortalLink: workspace.isPremium
      ? STRIPE_CUSTOMER_PORTAL_LINK
      : undefined,
  };
};

export const useStripePlans = (refId: string) => {
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
          paymentLink: plan.paymentLink
            ? `${plan.paymentLink}?client_reference_id=${refId}`
            : null,
        };
      }
      return null;
    });
  }, [availablePlans, refId]);

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
