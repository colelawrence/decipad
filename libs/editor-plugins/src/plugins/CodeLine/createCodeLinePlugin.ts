import { PlatePlugin } from '@udecode/plate';
import { Computer } from '@decipad/computer';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { CodeLine } from '@decipad/editor-components';
import { decorateTextSyntax } from '@decipad/editor-utils';
import { deserializeCodeLineHtml } from './deserializeCodeLineHtml';
import { serializeCodeLineHtml } from './serializeCodeLineHtml';

export const createCodeLinePlugin = (computer: Computer): PlatePlugin => ({
  key: ELEMENT_CODE_LINE,
  isElement: true,
  component: CodeLine,
  deserializeHtml: deserializeCodeLineHtml,
  serializeHtml: serializeCodeLineHtml,
  decorate: decorateTextSyntax(computer, ELEMENT_CODE_LINE),
});
