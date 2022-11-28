import { workspaces } from '@decipad/routing';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ErrorPage, LazyRoute } from '../meta';
import RedirectToDefaultWorkspace from './RedirectToDefaultWorkspace';

const loadWorkspace = () =>
  import(/* webpackChunkName: "workspace" */ './workspace/Workspace');
const Workspace = lazy(loadWorkspace);

// prefetch
loadWorkspace();

const Workspaces: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LazyRoute>
            <RedirectToDefaultWorkspace />
          </LazyRoute>
        }
      />
      <Route
        path={`${workspaces({}).workspace.template}/*`}
        element={
          <LazyRoute>
            <Workspace />
          </LazyRoute>
        }
      />
      <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
    </Routes>
  );
};
export default Workspaces;
