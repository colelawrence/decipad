import { DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';

export interface SyntaxErrorAnnotation {
  [DECORATE_SYNTAX_ERROR]: true;
  variant?: 'mismatched-brackets' | 'never-closed' | 'never-opened';
}
