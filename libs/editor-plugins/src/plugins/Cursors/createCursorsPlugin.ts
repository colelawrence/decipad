import { Computer } from '@decipad/language';
import { PlatePlugin } from '@udecode/plate';
import { MutableRefObject } from 'react';
import { getCursorPos } from './getCursorPos';

export interface CursorsPluginProps {
  cursorBlockIdRef: MutableRefObject<string | null>;
}

export const createCursorsPlugin = (computer: Computer): PlatePlugin => ({
  key: 'UPDATE_CURSORS_PLUGIN',
  handlers: {
    onChange: (editor) => () => {
      // eslint-disable-next-line no-param-reassign
      try {
        computer.setCursorBlockId(getCursorPos(editor));
      } catch (err) {
        // do nothing, not too important --
      }
    },
  },
});
