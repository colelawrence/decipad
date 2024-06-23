import type moo from 'moo';
import { Parser } from '@decipad/language-interfaces';
import { encodeMooToken } from './encodeMooToken';

export const encodeBracketError = <T extends Parser.BracketError>(
  error: T
): T => {
  const { open, close } = error as {
    open?: moo.Token;
    close?: moo.Token;
  };
  return {
    ...error,
    open: open && encodeMooToken(open),
    close: close && encodeMooToken(close),
  };
};
