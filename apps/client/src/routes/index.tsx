import { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { RequireSession } from '../components/RequireSession';
import { decode as decodeVanityUrlComponent } from '../lib/vanityUrlComponent';
import { Home } from './Home';
import { Notebook } from './Notebook';
import { Playground } from './Playground';
import { Workspace } from './Workspace';

export function Router(): ReturnType<FC> {
  return (
    <Switch>
      <Route
        path="/workspaces/:workspaceid/pads/:padid"
        render={({ match }) => (
          <RequireSession allowSecret>
            <Notebook
              workspaceId={match.params.workspaceid}
              notebookId={decodeVanityUrlComponent(match.params.padid)}
            />
          </RequireSession>
        )}
      />
      <Route
        path="/workspaces/:workspaceid"
        render={({ match }) => (
          <RequireSession>
            <Workspace workspaceId={match.params.workspaceid} />
          </RequireSession>
        )}
      />
      <Route path="/playground">
        <Playground />
      </Route>
      <Route path="/">
        <RequireSession>
          <Home />
        </RequireSession>
      </Route>
      <Route render={() => <>Not Found</>} />
    </Switch>
  );
}
