import { route, stringParser } from 'typesafe-routes';

const createNew = route('/create-new', {}, {});
const edit = route('/edit', {}, {});
const members = route('/members', {}, {});
const archived = route('/archived', {}, {});
const connections = route('/connections', {}, {});
const shared = route('/shared', {}, {});

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
