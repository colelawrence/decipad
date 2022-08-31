import { DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';
import { Range } from 'slate';

export interface SyntaxErrorAnnotation extends Range {
  [DECORATE_SYNTAX_ERROR]: true;
  variant?: 'mismatched-brackets' | 'never-closed' | 'never-opened';
}
