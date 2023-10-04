import { cursorStore } from '@decipad/react-contexts';
import {
  CursorData,
  CursorOverlayProps,
  CursorOverlay as PlateCursorOverlay,
} from '@udecode/plate';

// TODO: styling once plate decouples SC
export const CursorOverlay = (props: CursorOverlayProps<CursorData>) => {
  const cursors = cursorStore.use.cursors();

  return <PlateCursorOverlay {...props} cursors={cursors} />;
};
