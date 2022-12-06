import { MyEditor, MyPlatePlugin } from '@decipad/editor-types';
import { CursorEditor } from '@decipad/slate-yjs';
import { cursorStore } from '../../stores/cursorStore';
import { cursorColor } from './cursorColor';

export const createRemoteCursorsPlugin = (): MyPlatePlugin => ({
  key: 'PLUGIN_REMOTE_CURSORS',
  then: (_editor: MyEditor) => {
    setTimeout(() => {
      const editor = _editor as unknown as CursorEditor;
      editor.awareness.on('update', () => {
        const newCursorData = Array.from(editor.awareness.getStates())
          .filter(([clientId]) => clientId !== editor.sharedType.doc?.clientID)
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
                ...awareness,
                style: {
                  _backgroundColor: color,
                  backgroundColor: color.rgb,
                  width: 2,
                },
              },
            };
          })
          .filter(
            (cursor) => cursor.selection.anchor && cursor.selection.focus
          );

        cursorStore.set.cursors(newCursorData);
      });
    }, 0);
  },
});
