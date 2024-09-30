import type { Result } from '@decipad/language-interfaces';
import type { MyEditor, MyElement } from '@decipad/editor-types';
import { ELEMENT_VARIABLE_DEF } from '@decipad/editor-types';
import { textify } from '@decipad/parse';
import {
  findNodePath,
  focusEditor,
  getNodeString,
  removeNodes,
  setNodes,
} from '@udecode/plate-common';
import { getNodeEntrySafe } from './getNodeEntrySafe';
import { isElementOfType } from './isElementOfType';
import { insertNodes } from './insertNodes';
import { createStructuredCodeLine } from './createCodeLine';

export const convertVariableDefInto =
  (editor: MyEditor, element: MyElement, result?: Result.Result) =>
  (value: string) => {
    const at = findNodePath(editor, element);
    if (!at) {
      return;
    }
    if (value === 'calculation' && result) {
      let code: string;
      try {
        code = textify(result.value as Result.OneResult, result.type);
      } catch {
        return;
      }

      const entry = getNodeEntrySafe(editor, at);
      if (entry) {
        const [node] = entry;
        if (isElementOfType(node, ELEMENT_VARIABLE_DEF)) {
          const {
            id,
            children: [caption],
          } = node;
          const varName = getNodeString(caption);

          removeNodes(editor, { at });
          insertNodes(
            editor,
            [createStructuredCodeLine({ id, varName, code })],
            {
              at,
            }
          );
        }
      }
    }

    const coercedKind =
      value === 'toggle'
        ? 'boolean'
        : value === 'date'
        ? 'date'
        : value === 'dropdown'
        ? 'string'
        : 'number';

    setNodes(
      editor,
      { variant: value, coerceToType: { kind: coercedKind, date: 'day' } },
      { at }
    );
    focusEditor(editor);
  };
