import type { ComponentProps } from 'react';
import type { DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';
import type { Range } from 'slate';
import type { SyntaxErrorHighlight } from './plugins/SyntaxErrorHighlight';

export interface SyntaxErrorAnnotation extends Range {
  [DECORATE_SYNTAX_ERROR]: true;
  error?: string;
  variant: ComponentProps<typeof SyntaxErrorHighlight>['variant'];
}
