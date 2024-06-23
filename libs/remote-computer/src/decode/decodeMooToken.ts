import type moo from 'moo';

export const decodeMooToken = (token: moo.Token): moo.Token => ({
  ...token,
  toString: () => token.value,
});
