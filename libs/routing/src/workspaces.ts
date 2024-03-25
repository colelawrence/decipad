import { route, stringParser } from 'typesafe-routes';

const createNew = route('/create-new', {}, {});
const edit = route('/edit', {}, {});
const members = route('/members', {}, {});
const archived = route('/archived', {}, {});
const shared = route('/shared', {}, {});

const codeSecrets = route('/code-secrets', {}, {});
const webhooks = route('/webhooks', {}, {});
const sqlConnections = route('/sql-connections', {}, {});
const services = route('/services', {}, {});

const addcredits = route('/add-credits', {}, {});
const upgrade = route(
  '/upgrade/:newWorkspace?',
  {
    newWorkspace: stringParser,
  },
  {}
);

export const connections = route(
  '/connections',
  {},
  {
    codeSecrets,
    webhooks,
    sqlConnections,
    services,
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
    addcredits,
    upgrade,
  }
);

export default route('/w', {}, { workspace });
