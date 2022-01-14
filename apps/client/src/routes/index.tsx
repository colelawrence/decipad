import { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { RequireSession } from '../components/RequireSession';
import { RouteEvents } from '../components/RouteEvents';
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
            <RouteEvents category="notebook">
              <Notebook
                workspaceId={match.params.workspaceid}
                notebookId={decodeVanityUrlComponent(match.params.padid)}
              />
            </RouteEvents>
          </RequireSession>
        )}
      />
      <Route
        path="/workspaces/:workspaceid"
        render={({ match }) => (
          <RequireSession>
            <RouteEvents category="workspace">
              <Workspace workspaceId={match.params.workspaceid} />
            </RouteEvents>
          </RequireSession>
        )}
      />
      <Route path="/playground">
        <RouteEvents category="playground">
          <Playground />
        </RouteEvents>
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
