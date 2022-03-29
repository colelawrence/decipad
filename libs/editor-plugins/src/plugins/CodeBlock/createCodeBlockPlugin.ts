import { createPluginFactory } from '@udecode/plate';
import { ELEMENT_CODE_BLOCK } from '@decipad/editor-types';
import { CodeBlock } from '@decipad/editor-components';
import { deserializeCodeBlockHtml } from './deserializeCodeBlockHtml';
import { serializeCodeBlockHtml } from './serializeCodeBlockHtml';

export const createCodeBlockPlugin = createPluginFactory({
  key: ELEMENT_CODE_BLOCK,
  isElement: true,
  component: CodeBlock,
  deserializeHtml: deserializeCodeBlockHtml,
  serializeHtml: serializeCodeBlockHtml,
});
