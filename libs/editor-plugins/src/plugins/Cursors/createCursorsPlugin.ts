import { Computer } from '@decipad/computer';
import { MutableRefObject } from 'react';
import { MyPlatePlugin } from '@decipad/editor-types';
import { getCursorPos } from './getCursorPos';

export interface CursorsPluginProps {
  cursorBlockIdRef: MutableRefObject<string | null>;
}

export const createCursorsPlugin = (computer: Computer): MyPlatePlugin => ({
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
