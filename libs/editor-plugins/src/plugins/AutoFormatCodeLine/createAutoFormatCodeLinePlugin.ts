import { getAnalytics } from '@decipad/client-events';
import type { Computer } from '@decipad/computer-interfaces';
import type { BlockElement, MyGenericEditor } from '@decipad/editor-types';
import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import {
  createStructuredCodeLine,
  generateVarName,
  insertNodes,
} from '@decipad/editor-utils';
import type { EElement, Value } from '@udecode/plate-common';
import {
  getBlockAbove,
  getNodeString,
  isCollapsed,
  removeNodes,
  select,
  withoutNormalizing,
} from '@udecode/plate-common';
import { createOnKeyDownPluginFactory } from '@decipad/editor-plugin-factories';
import { UserInteraction } from '@decipad/react-contexts';
import { Subject } from 'rxjs';

const pluginName = 'AUTO_FORMAT_CODE_LINE_PLUGIN';

export const createAutoFormatCodeLinePlugin = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>(
  computer: Computer,
  interactions: Subject<UserInteraction> | undefined
) =>
  createOnKeyDownPluginFactory<TV, TE>({
    name: pluginName,
    plugin: (editor) => (event) => {
      // eslint-disable-next-line complexity
      const hasModifiers = event.ctrlKey || event.altKey || event.metaKey;

      if (hasModifiers || event.key !== '=') {
        return;
      }

      const entry = getBlockAbove<BlockElement>(editor);
      if (!entry) return;

      const { selection } = editor;
      if (!selection || !isCollapsed(selection)) {
        return;
      }

      const [node, paragraphPath] = entry;
      if (node.type !== ELEMENT_PARAGRAPH) {
        return;
      }

      event.preventDefault();

      const nodeText = `${getNodeString(node)}=`;

      if (nodeText.trim() !== '=') {
        interactions?.next({
          type: 'inline-equal',
          blockId: node.id!,
          path: selection.anchor.path,
          offset: selection.anchor.offset,
        });
        return;
      }

      getAnalytics().then((analytics) =>
        analytics?.track('convert paragraph to code line because =')
      );

      const autoVarName = computer.getAvailableIdentifier(generateVarName());
      const newCodeLine = createStructuredCodeLine({
        varName: autoVarName,
        code: '100$',
      }) as EElement<TV>;

      withoutNormalizing(editor, () => {
        removeNodes(editor, { at: paragraphPath });
        insertNodes(editor, [newCodeLine], { at: paragraphPath });
      });

      const codeTextPath = [...paragraphPath, 1];
      select(editor, codeTextPath);
    },
  });
