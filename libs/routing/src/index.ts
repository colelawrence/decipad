/* eslint-disable import/first */

// client side routes

export { default as workspaces } from './workspaces';
export { default as notebooks } from './notebooks';
export { default as playground } from './playground';

// server side routes

import docs from './docs';
import storybook from './storybook';

export { docs, storybook };

/**
 * All routes that are not included in the main frontend bundle
 * and must thus be loaded from the server using a full-page navigation.
 */
export const SERVER_SIDE_ROUTES = [docs, storybook];

// misc

export { SECRET_URL_PARAM } from './shared/secret';
export type { RouteNode } from 'typesafe-routes';
export { useRouteParams } from 'typesafe-routes/react-router';
