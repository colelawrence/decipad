import omit from 'lodash/omit';
import type moo from 'moo';

export const encodeMooToken = (token: moo.Token): moo.Token => ({
  ...omit(token, 'toString', 'tokenToString'),
});
