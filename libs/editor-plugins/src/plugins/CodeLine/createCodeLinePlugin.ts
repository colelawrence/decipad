import { PlatePlugin } from '@udecode/plate';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { CodeLine } from '@decipad/editor-components';
import { Computer } from '@decipad/language';
import { deserializeCodeLineHtml } from './deserializeCodeLineHtml';
import { serializeCodeLineHtml } from './serializeCodeLineHtml';
import { decorateCodeLine } from './decorateCodeLine';

export const createCodeLinePlugin = (computer: Computer): PlatePlugin => ({
  key: ELEMENT_CODE_LINE,
  isElement: true,
  component: CodeLine,
  deserializeHtml: deserializeCodeLineHtml,
  serializeHtml: serializeCodeLineHtml,
  decorate: decorateCodeLine(computer),
});
