import type { Computer } from '@decipad/computer-interfaces';
import type { MyValue } from '@decipad/editor-types';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { decorateCode } from '@decipad/editor-utils';
import {
  CodeLineV2,
  CodeLineV2Code,
  CodeLineV2Varname,
} from '@decipad/editor-components';

import type { PlateEditor, Value } from '@udecode/plate-common';

export const createCodeLineRootPlugin = (_computer: Computer) => ({
  key: ELEMENT_CODE_LINE_V2,
  isElement: true,
  component: CodeLineV2,
});

export const createCodeLineVarnamePlugin = (_computer: Computer) => ({
  key: ELEMENT_STRUCTURED_VARNAME,
  isElement: true,
  component: CodeLineV2Varname,
});

export const createCodeLineCodeTextPlugin = <
  TV extends Value = MyValue,
  TE extends PlateEditor<TV> = PlateEditor<TV>
>(
  computer: Computer
) => ({
  key: ELEMENT_CODE_LINE_V2_CODE,
  isElement: true,
  component: CodeLineV2Code,
  decorate: decorateCode<TV, TE>(computer, ELEMENT_CODE_LINE_V2_CODE),
});
