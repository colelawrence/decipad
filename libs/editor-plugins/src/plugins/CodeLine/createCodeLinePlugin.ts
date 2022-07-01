import { Computer } from '@decipad/computer';
import { ELEMENT_CODE_LINE, MyPlatePlugin } from '@decipad/editor-types';
import { decorateCode } from '@decipad/editor-utils';
import { deserializeCodeLineHtml } from './deserializeCodeLineHtml';
import { serializeCodeLineHtml } from './serializeCodeLineHtml';
import { onDropCodeLine } from './onDropCodeLine';
import { lazyElementComponent } from '../../utils/lazyElement';

const loadCodeLine = () =>
  import(/* webpackChunkName: "editor-code-line" */ './CodeLine');
// prefetch
loadCodeLine();

const LazyCodeLine = lazyElementComponent(loadCodeLine);

export const createCodeLinePlugin = (computer: Computer): MyPlatePlugin => ({
  key: ELEMENT_CODE_LINE,
  isElement: true,
  component: LazyCodeLine,
  deserializeHtml: deserializeCodeLineHtml,
  serializeHtml: serializeCodeLineHtml,
  decorate: decorateCode(computer, ELEMENT_CODE_LINE),
  handlers: {
    onDrop: onDropCodeLine(computer),
  },
});
