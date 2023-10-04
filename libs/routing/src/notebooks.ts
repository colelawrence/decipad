import { booleanParser, route, stringParser } from 'typesafe-routes';
import { descriptiveIdParser } from './shared/descriptive-id';
import { SECRET_URL_PARAM } from './shared/secret';

const notebook = route(
  `/:notebook&:tab?&:${SECRET_URL_PARAM}?&:embed?`,
  {
    notebook: descriptiveIdParser,
    [SECRET_URL_PARAM]: stringParser,
    embed: booleanParser,
    tab: stringParser,
  },
  {}
);

const acceptInvite = route(
  `/:notebook/accept-invite/:invite`,
  { notebook: descriptiveIdParser, invite: descriptiveIdParser },
  {}
);

const welcomeNotebook = route(`/welcome`, {}, {});

export default route('/n', {}, { notebook, acceptInvite, welcomeNotebook });
