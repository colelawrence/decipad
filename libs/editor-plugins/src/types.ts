import { ComponentProps } from 'react';
import { DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';
import { Range } from 'slate';
import { SyntaxErrorHighlight } from './plugins/SyntaxErrorHighlight';

export interface SyntaxErrorAnnotation extends Range {
  [DECORATE_SYNTAX_ERROR]: true;
  error?: string;
  variant: ComponentProps<typeof SyntaxErrorHighlight>['variant'];
}
