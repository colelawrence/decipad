import { route, stringParser } from 'typesafe-routes';

const createNew = route('/create-new', {}, {});
const edit = route('/edit', {}, {});
const members = route('/members', {}, {});
const archived = route('/archived', {}, {});
const shared = route('/shared', {}, {});

const codeSecrets = route('/code-secrets', {}, {});
const webhooks = route('/webhooks', {}, {});
const sqlConnections = route('/sql-connections', {}, {});
const integrations = route(
  '/integrations&:connected?',
  {
    connected: stringParser,
  },
  {}
);
const datasets = route('/datasets', {}, {});

const addcredits = route('/add-credits', {}, {});
export const connections = route(
  '/connections',
  {},
  {
    codeSecrets,
    webhooks,
    sqlConnections,
    integrations,
    datasets,
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
  }
);

export default route('/w', {}, { workspace });
