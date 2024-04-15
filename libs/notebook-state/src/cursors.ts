import { jsonify } from 'libs/slate-yjs/src/utils/jsonify';
import type {
  TCursorEditor as GTCursorEditor,
  TYjsEditor as GTYjsEditor,
} from '@decipad/slate-yjs';
import {
  blue400,
  brand400,
  orange400,
  purple400,
  red400,
  teal400,
  yellow500,
} from '@decipad/ui';
import type { OpaqueColor } from '@decipad/utils';
import { dequal } from '@decipad/utils';
import debounce from 'lodash.debounce';
import type { UserCursorState } from '@decipad/react-contexts';
import { cursorStore } from '@decipad/react-contexts';
import type { MinimalRootEditor } from '@decipad/editor-types';
import type { Session } from 'next-auth';

type TCursorEditor = GTCursorEditor<MinimalRootEditor>;
type TYjsEditor = GTYjsEditor<MinimalRootEditor>;

const colors = [
  orange400,
  red400,
  blue400,
  brand400,
  purple400,
  teal400,
  yellow500,
];

function cursorColor(clientID: number): OpaqueColor {
  return colors[clientID % colors.length];
}

const DEBOUNCE_MS = 1000;

function getCursorData(
  data: Map<number, { [key: string]: any }>,
  currentClientId: number
): Array<UserCursorState> {
  const clientIds: Record<string, boolean> = {};

  return Array.from(data)
    .filter(([clientId]) => {
      if (clientIds[clientId]) {
        return false;
      }

      clientIds[clientId] = true;

      return clientId !== currentClientId;
    })
    .map(([clientID, awareness]) => {
      const { anchor, focus } = awareness;
      const color = cursorColor(clientID);

      return {
        key: clientID,
        selection: {
          anchor,
          focus,
        },
        data: {
          ...(jsonify(awareness) as Session),
          color,
          style: {
            backgroundColor: color.rgb,
            width: 3,
          },
        },
      };
    })
    .filter((cursor) => cursor.selection.anchor && cursor.selection.focus);
}

export function cursorAwareness(editor: TCursorEditor & TYjsEditor) {
  const awarenessHandler = debounce(() => {
    const newCursorData = getCursorData(
      editor.awareness.getStates(),
      editor.sharedType.doc?.clientID ?? 0
    );

    if (!dequal(cursorStore.get.userCursors(), newCursorData)) {
      cursorStore.set.userCursors(newCursorData);
    }
  }, DEBOUNCE_MS);

  editor.awareness.on('update', awarenessHandler);
  editor.awareness.once('destroy', () => {
    editor.awareness.off('update', awarenessHandler);
  });
}
