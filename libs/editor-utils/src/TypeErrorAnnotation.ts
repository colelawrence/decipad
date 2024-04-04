import { type DECORATE_TYPE_ERROR } from '@decipad/editor-types';
import { type Range } from 'slate';

export interface TypeErrorAnnotation extends Range {
  [DECORATE_TYPE_ERROR]: true;
  error: string;
}
