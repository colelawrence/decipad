import type { MyNode } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate-common';
import type { UseEditorChangeOptions } from './useEditorChange';
import { useEditorChange } from './useEditorChange';

export const useNodeText = (
  node: MyNode,
  options?: UseEditorChangeOptions
): string | undefined => useEditorChange(() => getNodeString(node), options);
