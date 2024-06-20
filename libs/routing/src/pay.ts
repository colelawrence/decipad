import { route, stringParser } from 'typesafe-routes';

export default route(
  '/pay/:cs/:workspaceId/:plan/:newWorkspace?',
  {
    cs: stringParser,
    workspaceId: stringParser,
    plan: stringParser,
    newWorkspace: stringParser,
  },
  {}
);
