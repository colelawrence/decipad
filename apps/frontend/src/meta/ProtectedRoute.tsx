import { isFlagEnabled } from '@decipad/feature-flags';
import { useRouteParams, workspaces } from '@decipad/routing';
import { Navigate } from 'react-router-dom';

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

  if (isPaidPlan) {
    return <>{children}</>;
  }

  return <Navigate to={currentWorkspaceRoute.upgrade({}).$} />;
};

type RequireUpgradablePlanRouteProps = {
  isPaidPlan: boolean;
  children: React.ReactNode;
};

export const RequireUpgradablePlanRoute: React.FC<
  RequireUpgradablePlanRouteProps
> = ({ isPaidPlan, children }) => {
  const { workspaceId } = useRouteParams(workspaces({}).workspace);

  const currentWorkspaceRoute = workspaces({}).workspace({
    workspaceId,
  });

  const { newWorkspace } = useRouteParams(currentWorkspaceRoute.upgrade);

  if (isPaidPlan && !newWorkspace) {
    return <Navigate to={currentWorkspaceRoute.$} />;
  }

  return <>{children}</>;
};

type RequireFreePlanSlotRouteProps = {
  hasFreeWorkspaceSlot: boolean;
  children: React.ReactNode;
};

export const RequireFreePlanSlotRoute: React.FC<
  RequireFreePlanSlotRouteProps
> = ({ hasFreeWorkspaceSlot, children }) => {
  const { workspaceId } = useRouteParams(workspaces({}).workspace);
  const currentWorkspaceRoute = workspaces({}).workspace({
    workspaceId,
  });

  if (
    isFlagEnabled('NEW_PAYMENTS') &&
    !hasFreeWorkspaceSlot &&
    !isFlagEnabled('ALLOW_CREATE_NEW_WORKSPACE')
  ) {
    return <Navigate to={currentWorkspaceRoute.upgrade({}).$} />;
  }

  return <>{children}</>;
};
