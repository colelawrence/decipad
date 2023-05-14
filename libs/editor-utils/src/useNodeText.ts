import { MyNode } from '@decipad/editor-types';
import { useEditorChange } from '@decipad/editor-hooks';
import type { UseEditorChangeOptions } from '@decipad/editor-hooks';
import { getNodeString } from '@udecode/plate';

export const useNodeText = (
  node: MyNode,
  options?: UseEditorChangeOptions
): string | undefined => useEditorChange(() => getNodeString(node), options);
