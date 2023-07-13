import { route, stringParser } from 'typesafe-routes';

const createNew = route('/create-new', {}, {});
const edit = route('/edit', {}, {});
const members = route('/members', {}, {});
const archived = route('/archived', {}, {});
const shared = route('/shared', {}, {});

const codeSecrets = route('/code-secrets', {}, {});
const sqlConnections = route('/sql-connections', {}, {});

export const connections = route(
  '/connections',
  {},
  {
    codeSecrets,
    sqlConnections,
  }
);

const section = route('/section/:sectionId', { sectionId: stringParser }, {});

const workspace = route(
  '/:workspaceId',
  { workspaceId: stringParser },
  {
    createNew,
    edit,
    members,
    connections,
    archived,
    shared,
    section,
  }
);

export default route('/w', {}, { workspace });
