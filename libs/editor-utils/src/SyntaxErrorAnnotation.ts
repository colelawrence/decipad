import { type Range } from 'slate';
import { type DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';

export interface SyntaxErrorAnnotation extends Range {
  [DECORATE_SYNTAX_ERROR]: true;
  variant?: 'mismatched-brackets' | 'never-closed' | 'never-opened';
}
