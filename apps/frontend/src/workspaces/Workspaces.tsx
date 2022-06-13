import { workspaces } from '@decipad/routing';
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorPage, Frame, RequireSession } from '../meta';
import RedirectToDefaultWorkspace from './RedirectToDefaultWorkspace';

const loadWorkspace = () =>
  import(/* webpackChunkName: "workspace" */ './workspace/Workspace');
const Workspace = lazy(loadWorkspace);

// prefetch
loadWorkspace();

const Workspaces: React.FC = () => {
  return (
    <RequireSession>
      <Routes>
        <Route
          path="/"
          element={
            <Frame Heading="h1" title={null}>
              <RedirectToDefaultWorkspace />
            </Frame>
          }
        />
        <Route
          path={`${workspaces({}).workspace.template}/*`}
          element={
            <Frame Heading="h1" title={null}>
              <Workspace />
            </Frame>
          }
        />
        <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
      </Routes>
    </RequireSession>
  );
};
export default Workspaces;
