import { createZustandStore } from '@udecode/plate-common';
import type { BaseSelection } from 'slate';
import type { Session } from 'next-auth';
import type { OpaqueColor } from '@decipad/utils';

export type CursorData = {
  color?: OpaqueColor;
  style: {
    backgroundColor: string;
    width: number;
  };
};

export type UserCursorData = Session & CursorData;

export type CursorState<TCursorData extends CursorData = CursorData> = {
  key: string | number;
  selection: NonNullable<BaseSelection>;
  data: TCursorData;
};

export type UserCursorState = CursorState<UserCursorData>;

export const cursorsForTab = <TCursorData extends CursorData>(
  cursors: CursorState<TCursorData>[],
  tabIndex: number
) =>
  cursors
    .filter((c) => c.selection.anchor.path[0] === tabIndex)
    .map((c) => ({
      ...c,
      selection: {
        anchor: {
          path: c.selection.anchor.path.slice(1),
          offset: c.selection.anchor.offset,
        },
        focus: {
          path: c.selection.focus.path.slice(1),
          offset: c.selection.focus.offset,
        },
      },
    }));

export const cursorStore = createZustandStore('cursor')({
  userCursors: [] as UserCursorState[],
  dragCursor: null as CursorState | null,
})
  .extendSelectors((_state, get) => ({
    userCursorsForTab: (tabIndex: number) =>
      cursorsForTab(get.userCursors(), tabIndex),
  }))
  .extendActions((set) => ({
    resetDragCursor() {
      set.dragCursor(null);
    },
  }));
