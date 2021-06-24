import { Session } from 'next-auth';
import { Route, Switch } from 'react-router-dom';
import { RequireSession } from '../components/RequireSession';
import { decode as decodeVanityUrlComponent } from '../lib/vanityUrlComponent';
import { Home } from './Home';
import { Pad } from './Pad';
import { Playground } from './Playground';
import { Workspace } from './Workspace';

export function Router({ session }: { session: Session | null }) {
  return (
    <Switch>
      <Route
        path="/workspaces/:workspaceid/pads/:padid"
        render={({ match }) => (
          <RequireSession session={session}>
            <Pad
              workspaceId={match.params.workspaceid}
              padId={decodeVanityUrlComponent(match.params.padid)}
            />
          </RequireSession>
        )}
      />
      <Route
        path="/workspaces/:workspaceid"
        render={({ match }) => (
          <RequireSession session={session}>
            <Workspace workspaceId={match.params.workspaceid} />
          </RequireSession>
        )}
      />
      <Route path="/playground">
        <Playground />
      </Route>
      <Route path="/">
        <RequireSession session={session}>
          <Home />
        </RequireSession>
      </Route>
      <Route render={() => <>Not Found</>} />
    </Switch>
  );
}
