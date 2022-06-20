import {
  CursorData,
  CursorOverlay as PlateCursorOverlay,
  CursorOverlayProps,
} from '@udecode/plate';
import { cursorStore } from '@decipad/editor-plugins';

// TODO: styling once plate decouples SC
export const CursorOverlay = (props: CursorOverlayProps<CursorData>) => {
  const cursors = cursorStore.use.cursors();

  return <PlateCursorOverlay {...props} cursors={cursors} />;
};
