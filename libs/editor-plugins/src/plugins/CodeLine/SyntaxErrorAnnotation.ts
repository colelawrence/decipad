import { ComponentProps } from 'react';
import type { CodeErrorHighlight } from '@decipad/editor-components';
import { DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';

export interface SyntaxErrorAnnotation {
  [DECORATE_SYNTAX_ERROR]: true;
  variant: ComponentProps<typeof CodeErrorHighlight>['variant'];
}
