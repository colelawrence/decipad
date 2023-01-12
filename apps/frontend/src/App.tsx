import {
  docs,
  notebooks,
  onboard,
  playground,
  workspaces,
} from '@decipad/routing';
import { HelpMenu } from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { FC, lazy, useCallback } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useIntercom } from 'react-use-intercom';
import { ErrorPage, LazyRoute, RequireSession, RouteEvents } from './meta';
import { Onboard } from './Onboard/Onboard';
import { RequireOnboard } from './Onboard/RequireOnboard';
import { NotebookRedirect, WorkspaceRedirect } from './url-compat';

export const loadWorkspaces = () =>
  import(/* webpackChunkName: "workspaces" */ './workspaces/Workspaces');
const Workspaces = lazy(loadWorkspaces);
export const loadNotebooks = () =>
  import(/* webpackChunkName: "notebooks" */ './notebooks/Notebooks');
const Notebooks = lazy(loadNotebooks);
export const loadPlayground = () =>
  import(/* webpackChunkName: "playground" */ './playground/Playground');
const Playground = lazy(loadPlayground);

export const App: FC = () => {
  const { show, showNewMessages } = useIntercom();
  const session = useSession();

  const showFeedback = useCallback(() => {
    show();
    showNewMessages();
  }, [show, showNewMessages]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate replace to={workspaces({}).$} />} />
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
            <LazyRoute>
              <RequireOnboard>
                <Notebooks />
              </RequireOnboard>
            </LazyRoute>
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

      {session.status === 'authenticated' && (
        <HelpMenu
          discordUrl="https://discord.gg/CUtKEd3rBn"
          docsUrl={docs({}).$}
          onSelectSupport={show}
          onSelectFeedback={showFeedback}
        />
      )}
    </>
  );
};
