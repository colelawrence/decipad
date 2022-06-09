import { Computer } from '@decipad/computer';
import { ELEMENT_CODE_LINE, MyPlatePlugin } from '@decipad/editor-types';
import { CodeLine } from '@decipad/editor-components';
import { decorateCode } from '@decipad/editor-utils';
import { deserializeCodeLineHtml } from './deserializeCodeLineHtml';
import { serializeCodeLineHtml } from './serializeCodeLineHtml';
import { onDropCodeLine } from './onDropCodeLine';

export const createCodeLinePlugin = (computer: Computer): MyPlatePlugin => ({
  key: ELEMENT_CODE_LINE,
  isElement: true,
  component: CodeLine,
  deserializeHtml: deserializeCodeLineHtml,
  serializeHtml: serializeCodeLineHtml,
  decorate: decorateCode(computer, ELEMENT_CODE_LINE),
  handlers: {
    onDrop: onDropCodeLine,
  },
});
