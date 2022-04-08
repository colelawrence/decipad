import { notebooks, playground, workspaces } from '@decipad/routing';
import { GlobalStyles, VerifyEmail } from '@decipad/ui';
import { FC } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { RequireSession } from '../components/RequireSession';
import { RouteEvents } from '../components/RouteEvents';
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
      <Redirect from="/workspaces/**" to={`${workspaces.template}/**`} />
      <Route path={workspaces.template + workspaces({}).workspace.template}>
        <Switch>
          <Redirect
            // redirect legacy notebook path for a while
            exact
            from={`${workspaces.template}${
              workspaces({}).workspace.template
            }/pads${notebooks({}).notebook.template}`}
            to={{
              pathname: notebooks.template + notebooks({}).notebook.template,
              search: window.location.search,
            }}
          />
          <Route>
            <RequireSession>
              <RouteEvents category="workspace">
                <Workspace />
              </RouteEvents>
            </RequireSession>
          </Route>
        </Switch>
      </Route>
      <Route path={notebooks.template + notebooks({}).notebook.template}>
        <RequireSession allowSecret>
          <Notebook />
        </RequireSession>
      </Route>
      <Route exact path={playground.template}>
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
