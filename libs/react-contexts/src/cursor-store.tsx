import { createZustandStore } from '@udecode/plate-common';

export const cursorStore = createZustandStore('cursor')({
  cursors: {},
}).extendActions((set) => ({
  reset() {
    set.cursors({});
  },
}));
