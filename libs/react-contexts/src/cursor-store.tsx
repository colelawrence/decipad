import { createStore } from '@udecode/plate-common';

export const cursorStore = createStore('cursor')({
  cursors: {},
}).extendActions((set) => ({
  reset() {
    set.cursors({});
  },
}));
