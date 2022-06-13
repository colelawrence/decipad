import { FC, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { notebooks, playground, workspaces } from '@decipad/routing';
import { ErrorPage, Frame, RouteEvents } from './meta';
import { NotebookRedirect, WorkspaceRedirect } from './url-compat';

const loadWorkspaces = () =>
  import(/* webpackChunkName: "workspaces" */ './workspaces/Workspaces');
const Workspaces = lazy(loadWorkspaces);
const loadNotebooks = () =>
  import(/* webpackChunkName: "notebooks" */ './notebooks/Notebooks');
const Notebooks = lazy(loadNotebooks);
const loadPlayground = () =>
  import(/* webpackChunkName: "playground" */ './playground/Playground');
const Playground = lazy(loadPlayground);

// prefetch
loadWorkspaces().then(loadNotebooks);

export const App: FC = () => {
  return (
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
          <RouteEvents category="workspace">
            <Frame Heading="h1" title={null}>
              <Workspaces />
            </Frame>
          </RouteEvents>
        }
      />
      <Route
        path={`${notebooks.template}/*`}
        element={
          <Frame Heading="h1" title={null}>
            <Notebooks />
          </Frame>
        }
      />
      <Route path={playground.template} element={<Playground />} />
      <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
    </Routes>
  );
};
