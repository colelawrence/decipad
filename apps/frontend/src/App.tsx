import { isFlagEnabled } from '@decipad/feature-flags';
import { useCanUseDom } from '@decipad/react-utils';
import {
  docs,
  notebooks,
  onboard,
  playground,
  workspaces,
} from '@decipad/routing';
import { FeatureFlagsSwitcher, HelpMenu } from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { FC, lazy } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import { Onboard } from './Onboard/LazyOnboard';
import { RequireOnboard } from './Onboard/RequireOnboard';
import { ErrorPage, LazyRoute, RequireSession, RouteEvents } from './meta';
import Notebooks from './notebooks/Notebooks';
import { NotebookRedirect, WorkspaceRedirect } from './url-compat';

export const loadWorkspaces = () =>
  import(/* webpackChunkName: "workspaces" */ './workspaces/Workspaces');
const Workspaces = lazy(loadWorkspaces);
export const loadPlayground = () =>
  import(/* webpackChunkName: "playground" */ './playground/Playground');
const Playground = lazy(loadPlayground);

export const App: FC = () => {
  const session = useSession();
  const canUseDom = useCanUseDom();

  const [searchParams] = useSearchParams();
  const isRedirectFromStripe = !!searchParams.get('fromStripe');

  const redirectTo = isRedirectFromStripe
    ? `${workspaces({}).$}?fromStripe=true`
    : workspaces({}).$;

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate replace to={redirectTo} />} />
        <Route
          path="/workspaces/:workspaceId/pads/*"
          element={<NotebookRedirect />}
        />
        <Route path="/workspaces/*" element={<WorkspaceRedirect />} />
        <Route
          path={`${workspaces.template}/*`}
          element={
            <RequireSession>
              <RouteEvents category="workspace">
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
            <RouteEvents category="playground">
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
        <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
      </Routes>

      {canUseDom && session.status === 'authenticated' && (
        <HelpMenu
          discordUrl="http://discord.gg/decipad"
          docsUrl={docs({}).$}
          releaseUrl={docs({}).page({ name: 'releases' }).$}
        />
      )}
      {/* Feature flagging the feature flag switcher makes it unreacheable in
      production, even if you press the shortcut, unless you know how */}
      {canUseDom &&
        isFlagEnabled('FEATURE_FLAG_SWITCHER') &&
        createPortal(<FeatureFlagsSwitcher />, document.body)}
    </>
  );
};
