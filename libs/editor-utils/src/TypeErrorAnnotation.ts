import { DECORATE_TYPE_ERROR } from '@decipad/editor-types';
import { Range } from 'slate';

export interface TypeErrorAnnotation extends Range {
  [DECORATE_TYPE_ERROR]: true;
  error: string;
}
