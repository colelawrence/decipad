import { notebooks } from '@decipad/routing';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ErrorPage, RequireSession, RouteEvents } from '../meta';
import Notebook from './notebook/Notebook';
import NotebookInvite from './notebookInvite/notebookInvite';

const Notebooks: React.FC = () => {
  const routeDefs = notebooks({});
  const { key } = useLocation();

  return (
    <Routes>
      <Route
        path={routeDefs.notebook.template}
        element={
          <RouteEvents category="notebook">
            <Notebook key={key} />
          </RouteEvents>
        }
      />
      <Route
        path={routeDefs.acceptInvite.template}
        element={
          <RouteEvents category="notebook">
            <RequireSession>
              <NotebookInvite />
            </RequireSession>
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
