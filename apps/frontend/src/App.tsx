import { FC, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { docs, notebooks, playground, workspaces } from '@decipad/routing';
import { HelpMenu } from '@decipad/ui';
import { useIntercom } from 'react-use-intercom';
import { useSession } from 'next-auth/react';
import { ErrorPage, RequireSession, LazyRoute, RouteEvents } from './meta';
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
  const { show } = useIntercom();
  const session = useSession();
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
                  <Workspaces />
                </LazyRoute>
              </RouteEvents>
            </RequireSession>
          }
        />
        <Route
          path={`${notebooks.template}/*`}
          element={
            <LazyRoute>
              <Notebooks />
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
        <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
      </Routes>

      {session.status === 'authenticated' && (
        <HelpMenu
          discordUrl="https://discord.com/invite/HwDMqwbGmc"
          docsUrl={docs({}).$}
          onSelectSupport={show}
        />
      )}
    </>
  );
};
