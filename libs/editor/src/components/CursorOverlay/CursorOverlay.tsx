import { cursorStore } from '@decipad/react-contexts';
import {
  CursorData,
  CursorOverlayProps,
  CursorOverlay as PlateCursorOverlay,
} from '@udecode/plate';

// TODO: styling once plate decouples SC
export const CursorOverlay = (
  props: CursorOverlayProps<CursorData> & { tabIndex: number }
) => {
  // eslint-disable-next-line no-underscore-dangle
  const _cursors = cursorStore.use.cursors();

  const cursors = Array.isArray(_cursors)
    ? _cursors
        .filter((c) => c.data.anchor.path[0] === props.tabIndex)
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
          data: {
            ...c.data,
            anchor: {
              path: c.data.anchor.path.slice(1),
              offset: c.data.anchor.offset,
            },
            focus: {
              path: c.data.focus.path.slice(1),
              offset: c.data.focus.offset,
            },
          },
        }))
    : {};

  return <PlateCursorOverlay {...props} cursors={cursors} />;
};
