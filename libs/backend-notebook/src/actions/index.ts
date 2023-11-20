import { actions as baseActions } from '@decipad/notebook-open-api';
import { createNotebook } from './createNotebook';
import { evalCode } from './evalCode';
import { generateCode } from './generateCode';

export const actions = {
  ...baseActions,
  createNotebook,
  evalCode,
  generateCode,
};
