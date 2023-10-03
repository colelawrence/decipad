import createDebug from 'debug';

const BASE = '@decipad/backend-notebook-assistant';

export const debug = createDebug(BASE);

export const createSubDebug = (suffix: string) =>
  createDebug(`${BASE}/${suffix}`);
