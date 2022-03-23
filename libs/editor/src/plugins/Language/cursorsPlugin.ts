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
      computer.setCursorBlockId(getCursorPos(editor));
    },
  },
});
