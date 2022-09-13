import { ELEMENT_CODE_LINE, MyPlatePlugin } from '@decipad/editor-types';
import { decorateCode } from '@decipad/editor-utils';
import { deserializeCodeLineHtml } from './deserializeCodeLineHtml';
import { serializeCodeLineHtml } from './serializeCodeLineHtml';
import { onDropCodeLine } from './onDropCodeLine';
import CodeLine from './CodeLine';
import { withCodeLine } from './withCodeLine';
import { onKeyDownCodeLine } from './onKeyDownCodeLine';

export const createCodeLinePlugin = (): MyPlatePlugin => ({
  key: ELEMENT_CODE_LINE,
  isElement: true,
  component: CodeLine,
  deserializeHtml: deserializeCodeLineHtml,
  serializeHtml: serializeCodeLineHtml,
  decorate: decorateCode(ELEMENT_CODE_LINE),
  withOverrides: withCodeLine,
  handlers: {
    onDrop: onDropCodeLine,
    onKeyDown: onKeyDownCodeLine,
  },
});
