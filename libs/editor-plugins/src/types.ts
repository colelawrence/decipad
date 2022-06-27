import { ComponentProps } from 'react';
import type { CodeErrorHighlight } from '@decipad/editor-components';
import { DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';
import { Range } from 'slate';

export interface SyntaxErrorAnnotation extends Range {
  [DECORATE_SYNTAX_ERROR]: true;
  error?: string;
  variant: ComponentProps<typeof CodeErrorHighlight>['variant'];
}
