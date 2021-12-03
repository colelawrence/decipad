import docs from './docs';
import storybook from './storybook';

export { docs, storybook };

/**
 * All routes that are not included in the main frontend bundle
 * and must thus be loaded from the server using a full-page navigation.
 */
export const SERVER_SIDE_ROUTES = [docs, storybook];

export type { RouteNode } from 'typesafe-routes';
