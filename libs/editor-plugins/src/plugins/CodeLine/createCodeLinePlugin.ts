import type { MyPlatePlugin } from '@decipad/editor-types';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { decorateCode } from '@decipad/editor-utils';
import type { Computer } from '@decipad/computer-interfaces';
import { eventEditorActions } from '@udecode/plate-common';
import { deserializeCodeLineHtml } from './deserializeCodeLineHtml';
import { serializeCodeLineHtml } from './serializeCodeLineHtml';
import { onDropCodeLine } from './onDropCodeLine';
import CodeLine from './CodeLine';
import { withCodeLine } from './withCodeLine';
import { onKeyDownCodeLine } from './onKeyDownCodeLine';

export const createCodeLinePlugin = (computer: Computer): MyPlatePlugin => ({
  key: ELEMENT_CODE_LINE,
  isElement: true,
  component: CodeLine,
  deserializeHtml: deserializeCodeLineHtml,
  serializeHtml: serializeCodeLineHtml,
  decorate: decorateCode(computer, ELEMENT_CODE_LINE),
  withOverrides: withCodeLine,
  handlers: {
    onDrop: onDropCodeLine,
    onKeyDown: onKeyDownCodeLine(computer),
    onFocus: () => () => {
      eventEditorActions.blur('');
    },
  },
});
