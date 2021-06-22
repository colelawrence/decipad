import { Switch, Route } from 'react-router-dom';
import { Session } from 'next-auth';
import { RequireSession } from '../RequireSession';
import { Playground } from '../../routes/Playground';
import { Home } from '../../routes/Home';
import { Workspace } from '../../routes/Workspace';
import { Pad } from '../../routes/Pad';

export function Router({ session }: { session: Session | null }) {
  return (
    <Switch>
      <Route
        path="/workspaces/:workspaceid/pads/:padid"
        render={({ match }) => (
          <RequireSession session={session}>
            <Pad
              workspaceId={match.params.workspaceid}
              padId={match.params.padid}
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
