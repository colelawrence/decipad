import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ImportElementSource,
  LiveConnectionElement,
  MyEditor,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { insertNodes, isCollapsed } from '@udecode/plate';
import { nanoid } from 'nanoid';

export const insertLiveConnection = (
  editor: MyEditor,
  source?: ImportElementSource,
  url?: string
) => {
  const { selection } = editor;
  if (isCollapsed(selection) && selection?.anchor && url) {
    const liveConnEl: LiveConnectionElement = {
      id: nanoid(),
      type: ELEMENT_LIVE_CONNECTION,
      url,
      source,
      isFirstRowHeaderRow: false,
      columnTypeCoercions: [],
      children: [
        {
          id: nanoid(),
          type: ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
          children: [{ text: '' }],
        },
      ],
    };
    insertNodes(editor, liveConnEl, {
      at: requirePathBelowBlock(editor, selection.anchor.path),
    });
  }
};
