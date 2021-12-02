import { tokenRules } from '@decipad/language';

export const identifierNamePattern = new RegExp(
  tokenRules.main.identifier.match,
  'g'
);
