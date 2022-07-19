import { notebooks } from '@decipad/routing';
import { Routes, Route } from 'react-router-dom';
import { ErrorPage, RequireSession, RouteEvents } from '../meta';
import Notebook from './notebook/Notebook';

const Notebooks: React.FC = () => {
  return (
    <Routes>
      <Route
        path={notebooks({}).notebook.template}
        element={
          <RouteEvents category="notebook">
            <Notebook />
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
