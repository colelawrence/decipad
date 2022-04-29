import { route, stringParser } from 'typesafe-routes';
import { descriptiveIdParser } from './shared/descriptive-id';
import { SECRET_URL_PARAM } from './shared/secret';

const notebook = route(
  `/:notebook&:${SECRET_URL_PARAM}?`,
  { notebook: descriptiveIdParser, [SECRET_URL_PARAM]: stringParser },
  {}
);

export default route('/n', {}, { notebook });
