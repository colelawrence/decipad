import { isFlagEnabled } from '@decipad/feature-flags';
import { useRouteParams, workspaces } from '@decipad/routing';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

type RequirePaidPlanRouteProps = {
  isPaidPlan: boolean;
  children: React.ReactNode;
};

export const RequirePaidPlanRoute: React.FC<RequirePaidPlanRouteProps> = ({
  isPaidPlan,
  children,
}) => {
  const { workspaceId } = useRouteParams(workspaces({}).workspace);
  const currentWorkspaceRoute = workspaces({}).workspace({
    workspaceId,
  });
  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();

  useEffect(() => {
    if (!isPaidPlan) {
      setIsUpgradeWorkspaceModalOpen(true);
    }
  }, [isPaidPlan, setIsUpgradeWorkspaceModalOpen]);

  if (isPaidPlan) {
    return <>{children}</>;
  }

  return <Navigate to={currentWorkspaceRoute.$} />;
};

type RequireFreePlanSlotRouteProps = {
  hasFreeWorkspaceSlot: boolean;
  children: React.ReactNode;
};

export const RequireFreePlanSlotRoute: React.FC<
  RequireFreePlanSlotRouteProps
> = ({ hasFreeWorkspaceSlot, children }) => {
  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();
  const { workspaceId } = useRouteParams(workspaces({}).workspace);
  const currentWorkspaceRoute = workspaces({}).workspace({
    workspaceId,
  });

  useEffect(() => {
    if (!hasFreeWorkspaceSlot && !isFlagEnabled('ALLOW_CREATE_NEW_WORKSPACE')) {
      setIsUpgradeWorkspaceModalOpen(true);
    }
  }, [hasFreeWorkspaceSlot, setIsUpgradeWorkspaceModalOpen]);

  if (!hasFreeWorkspaceSlot && !isFlagEnabled('ALLOW_CREATE_NEW_WORKSPACE')) {
    return <Navigate to={currentWorkspaceRoute.$} />;
  }

  return <>{children}</>;
};
