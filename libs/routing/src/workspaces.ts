import { route, stringParser } from 'typesafe-routes';

const createNew = route('/create-new', {}, {});
const edit = route('/edit', {}, {});
const archived = route('/archived', {}, {});
const shared = route('/shared', {}, {});

const section = route('/section/:sectionId', { sectionId: stringParser }, {});

const workspace = route(
  '/:workspaceId',
  { workspaceId: stringParser },
  {
    createNew,
    edit,
    archived,
    shared,
    section,
  }
);

export default route('/w', {}, { workspace });
