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
