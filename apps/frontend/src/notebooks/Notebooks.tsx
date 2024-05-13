import { notebooks } from '@decipad/routing';
import { Routes, Route, Outlet } from 'react-router-dom';
import { ErrorPage, RequireSession, RouteEvents } from '../meta';
import Notebook from './notebook/Notebook';
import NotebookInvite from './notebookInvite/notebookInvite';
import { WelcomeNotebookRedirect } from '../Onboard/WelcomeNotebookRedirect';

const Notebooks: React.FC = () => {
  const routeDefs = notebooks({});

  return (
    <Routes>
      <Route
        path="/:notebook/:tab?"
        element={
          <RouteEvents category="Notebook Loaded">
            <Notebook />
            <Outlet />
          </RouteEvents>
        }
      ></Route>
      <Route
        path={routeDefs.acceptInvite.template}
        element={
          <RouteEvents category="Notebook Loaded">
            <RequireSession>
              <NotebookInvite />
            </RequireSession>
          </RouteEvents>
        }
      />
      <Route
        path={routeDefs.welcomeNotebook.template}
        element={<WelcomeNotebookRedirect />}
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
