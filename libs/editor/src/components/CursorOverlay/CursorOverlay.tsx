import type { CursorData, CursorState } from '@decipad/react-contexts';
import { cursorStore, useTabEditorContext } from '@decipad/react-contexts';
import { CursorOverlay as CursorOverlayPrimitive } from '@decipad/editor-components';
import type { CursorOverlayProps } from '@udecode/plate-cursor';

// TODO: styling once plate decouples SC
export const CursorOverlay = (props: CursorOverlayProps<CursorData>) => {
  const { tabIndex } = useTabEditorContext();
  const userCursors = cursorStore.use.userCursorsForTab(tabIndex);

  const userCursorRecord = Object.fromEntries(
    userCursors.map((c) => [c.key, c])
  ) as Record<string, CursorState>;

  const dragCursor = cursorStore.use.dragCursor();

  const cursorRecord = {
    ...userCursorRecord,
    ...(dragCursor && { [dragCursor.key]: dragCursor }),
  };

  return <CursorOverlayPrimitive {...props} cursors={cursorRecord} />;
};
