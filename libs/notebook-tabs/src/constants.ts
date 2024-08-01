export const TITLE_INDEX = 0;
export const DATA_TAB_INDEX = 1;
export const FIRST_TAB_INDEX = 2;

// We have Title, DataTab and only then the content tabs
// This means our's path's are off by 2.
// [2, 0] points to the first tab, 2 - 2 = 0.
export const SUB_EDITOR_OFFSET = 2;

export const INITIAL_TAB_NAME = 'New Tab';
