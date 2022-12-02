import { route, stringParser } from 'typesafe-routes';

const createNew = route('/create-new', {}, {});
const edit = route('/edit', {}, {});
const archived = route('/archived', {}, {});
const published = route('/published', {}, {});
const privateNotebooks = route('/private', {}, {});

const section = route('/section/:sectionId', { sectionId: stringParser }, {});

const workspace = route(
  '/:workspaceId',
  { workspaceId: stringParser },
  {
    createNew,
    edit,
    archived,
    section,
    published,
    privateNotebooks,
  }
);

export default route('/w', {}, { workspace });
