import type moo from 'moo';
import { Parser } from '@decipad/language-interfaces';
import { decodeMooToken } from './decodeMooToken';

export const decodeBracketError = <T extends Parser.BracketError>(
  error: T
): T => {
  const { open, close } = error as {
    open?: moo.Token;
    close?: moo.Token;
  };
  return {
    ...error,
    open: open && decodeMooToken(open),
    close: close && decodeMooToken(close),
  };
};
