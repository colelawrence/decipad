import { createStore } from '@udecode/plate';

export const cursorStore = createStore('cursor')({
  cursors: {},
}).extendActions((set) => ({
  reset() {
    set.cursors({});
  },
}));
