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
const STRIPE_PAYMENT_LINK = process.env.REACT_APP_STRIPE_PAYMENT_LINK;
const STRIPE_CUSTOMER_PORTAL_LINK =
  process.env.REACT_APP_STRIPE_CUSTOMER_PORTAL_LINK;

export const useStripeLinks = (workspace: WorkspaceTrait) => {
  const paymentLink = `${STRIPE_PAYMENT_LINK}?client_reference_id=${workspace.id}`;
  return {
    paymentLink: !workspace.isPremium ? paymentLink : undefined,
    customerPortalLink: workspace.isPremium
      ? STRIPE_CUSTOMER_PORTAL_LINK
      : undefined,
  };
};

export const useStripeCollaborationRules = (
  usersWithAccess: NotebookAvatarTrait[] = [],
  usersFromTeam: NotebookAvatarTrait[] = []
) => {
  const teamExcludingAdmins = usersFromTeam.filter(
    (member) => member.permission !== 'ADMIN'
  );

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
