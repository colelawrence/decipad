import { lazyLoad } from '@decipad/react-utils';
import {
  notebooks,
  onboard,
  pay,
  playground,
  workspaces,
} from '@decipad/routing';
import { SubscriptionPayment } from 'libs/ui/src/shared/templates/PaywallModal/SubscriptionPayment';
import { useMemo, type FC } from 'react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import { Onboard } from './Onboard/Onboard';
import { RequireOnboard } from './Onboard/RequireOnboard';
import { ErrorPage, LazyRoute, RequireSession, RouteEvents } from './meta';
import Notebooks from './notebooks/Notebooks';
import { NotebookRedirect, WorkspaceRedirect } from './url-compat';

export const loadWorkspaces = () =>
  import(/* webpackChunkName: "workspaces" */ './workspaces/Workspaces');
const Workspaces = lazyLoad(loadWorkspaces);
export const loadPlayground = () =>
  import(/* webpackChunkName: "playground" */ './playground/Playground');
const Playground = lazyLoad(loadPlayground);

const createRedirectToWorkspacesUrl = (searchParams: URLSearchParams) => {
  const searchParamsEntries = Array.from(searchParams.entries());
  const searchParamsString = searchParamsEntries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return (
    workspaces({}).$ + (searchParamsString ? `?${searchParamsString}` : '')
  );
};

const NavigateToWorkspaces: FC = () => {
  const [searchParams] = useSearchParams();
  const to = useMemo(
    () => createRedirectToWorkspacesUrl(searchParams),
    [searchParams]
  );
  return <Navigate to={to} replace />;
};

export const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<NavigateToWorkspaces />} />
      <Route
        path="/workspaces/:workspaceId/pads/*"
        element={<NotebookRedirect />}
      />
      <Route path="/workspaces/*" element={<WorkspaceRedirect />} />
      <Route
        path={`${workspaces.template}/*`}
        element={
          <RequireSession>
            <RouteEvents category="Workspace Loaded">
              <LazyRoute>
                <RequireOnboard>
                  <Workspaces />
                </RequireOnboard>
              </LazyRoute>
            </RouteEvents>
          </RequireSession>
        }
      />
      <Route
        path={`${notebooks.template}/*`}
        element={
          <RequireOnboard>
            <Notebooks />
          </RequireOnboard>
        }
      />

      <Route
        path={playground.template}
        element={
          <RouteEvents category="Playground Loaded">
            <LazyRoute>
              <Playground />
            </LazyRoute>
          </RouteEvents>
        }
      />

      <Route
        path={`${onboard.template}/*`}
        element={
          <RequireSession>
            <LazyRoute>
              <Onboard />
            </LazyRoute>
          </RequireSession>
        }
      />

      <Route
        path={`${pay.template}/*`}
        element={
          <RouteEvents category="Playground Loaded">
            <LazyRoute>
              <SubscriptionPayment />
            </LazyRoute>
          </RouteEvents>
        }
      />

      <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
    </Routes>
  );
};
