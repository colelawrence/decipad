import { notebooks } from '@decipad/routing';
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorPage, LazyRoute, RequireSession, RouteEvents } from '../meta';

const loadNotebook = () =>
  import(/* webpackChunkName: "notebook" */ './notebook/Notebook');
const Notebook = lazy(loadNotebook);

// prefetch
loadNotebook();

const Notebooks: React.FC = () => {
  return (
    <Routes>
      <Route
        path={notebooks({}).notebook.template}
        element={
          <RouteEvents category="notebook">
            <LazyRoute>
              <Notebook />
            </LazyRoute>
          </RouteEvents>
        }
      />
      <Route
        path="*"
        element={
          <RequireSession>
            <ErrorPage Heading="h1" wellKnown="404" />
          </RequireSession>
        }
      />
    </Routes>
  );
};
export default Notebooks;
