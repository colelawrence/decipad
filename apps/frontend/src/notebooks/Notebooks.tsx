import { notebooks } from '@decipad/routing';
import { Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import { ErrorPage, RequireSession, RouteEvents } from '../meta';
import Notebook from './notebook/Notebook';
import NotebookInvite from './notebookInvite/notebookInvite';
import { WelcomeNotebookRedirect } from '../Onboard/WelcomeNotebookRedirect';
import { AddCreditsModal } from '@decipad/ui';

const Notebooks: React.FC = () => {
  const routeDefs = notebooks({});
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/:notebook/:tab?"
        element={
          <RouteEvents category="notebook">
            <Notebook />
            <Outlet />
          </RouteEvents>
        }
      >
        <Route
          path="add-credits"
          element={<AddCreditsModal closeAction={() => navigate(-1)} />}
        />
      </Route>
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
