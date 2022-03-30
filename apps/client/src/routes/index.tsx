import { GlobalStyles, VerifyEmail } from '@decipad/ui';
import { FC } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
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
      <Route exact path="/">
        <RequireSession>
          <Home />
        </RequireSession>
      </Route>
      <Redirect from="/workspaces/:workspaceId/pads/:padId" to="/n/:padId" />
      <Redirect from="/workspaces/:workspaceid" to="/w/:workspaceid" />
      <Route
        path="/w/:workspaceid"
        render={({ match }) => (
          <RequireSession>
            <RouteEvents category="workspace">
              <Workspace workspaceId={match.params.workspaceid} />
            </RouteEvents>
          </RequireSession>
        )}
      />
      <Route
        path={['/n/:padid']}
        render={({ match }) => (
          <RequireSession allowSecret>
            <Notebook
              notebookId={decodeVanityUrlComponent(match.params.padid)}
            />
          </RequireSession>
        )}
      />
      <Route exact path="/playground">
        <RouteEvents category="playground">
          <Playground />
        </RouteEvents>
      </Route>
      <Route exact path="/verifyEmail">
        <GlobalStyles>
          <VerifyEmail />
        </GlobalStyles>
      </Route>
      <Route render={() => <>Not Found</>} />
    </Switch>
  );
}
