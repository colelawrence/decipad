import { route, stringParser } from 'typesafe-routes';

const createNew = route('/create-new', {}, {});
const edit = route('/edit', {}, {});

const workspace = route(
  '/:workspaceId',
  { workspaceId: stringParser },
  { createNew, edit }
);

export default route('/w', {}, { workspace });
