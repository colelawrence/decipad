import { BaseSelection } from 'slate';
import { jsonify } from 'libs/slate-yjs/src/utils/jsonify';
import { CursorEditor } from '@decipad/slate-yjs';
import {
  OpaqueColor,
  blue400,
  brand400,
  orange400,
  purple400,
  red400,
  teal400,
  yellow500,
} from '@decipad/ui';
import debounce from 'lodash.debounce';
import { cursorStore } from '@decipad/react-contexts';

type CursorData = {
  key: number;
  selection: NonNullable<BaseSelection>;
  data: {
    style: {
      _backgroundColor: OpaqueColor;
      backgroundColor: string;
      width: number;
    };
  };
};

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

const RETRY_INTERVAL_MS = 1000;
const DEBOUNCE_MS = 1000;

function getCursorData(
  data: Map<number, { [key: string]: any }>,
  currentClientId: number
): Array<CursorData> {
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
          ...jsonify(awareness),
          style: {
            _backgroundColor: color,
            backgroundColor: color.rgb,
            width: 3,
          },
        },
      };
    })
    .filter((cursor) => cursor.selection.anchor && cursor.selection.focus);
}

export function CursorAwarenessSchedule(editor: CursorEditor) {
  setTimeout(() => {
    editor.awareness.on(
      'update',
      debounce(() => {
        const newCursorData = getCursorData(
          editor.awareness.getStates(),
          editor.sharedType.doc?.clientID ?? 0
        );

        cursorStore.set.cursors(newCursorData);
      }, DEBOUNCE_MS)
    );
  }, RETRY_INTERVAL_MS);
}
