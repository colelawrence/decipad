import type { CursorOverlayProps, CursorProps } from '@udecode/plate-cursor';
import { CursorOverlay as CursorOverlayPrimitive } from '@udecode/plate-cursor';
import type { CursorData as DecipadCursorData } from '@decipad/react-contexts';
import { cn } from '@decipad/ui';

export function Cursor({
  data,
  selectionRects,
  caretPosition,
  disableCaret,
  disableSelection,
  classNames,
}: CursorProps<DecipadCursorData>) {
  if (!data) {
    return null;
  }

  const { style } = data;

  return (
    <>
      {!disableSelection &&
        selectionRects.map((position, i) => (
          <div
            key={i}
            className={cn(
              'pointer-events-none absolute z-10 opacity-[0.3]',
              classNames?.selectionRect
            )}
            style={{
              ...style,
              ...position,
            }}
          />
        ))}
      {!disableCaret && caretPosition && (
        <div
          className={cn(
            'pointer-events-none absolute z-10 w-0.5',
            classNames?.caret
          )}
          style={{ ...caretPosition, ...style }}
        />
      )}
    </>
  );
}

export function CursorOverlay({
  cursors,
  ...props
}: CursorOverlayProps<DecipadCursorData>) {
  return (
    <CursorOverlayPrimitive
      {...props}
      cursors={cursors}
      onRenderCursor={Cursor as any}
    />
  );
}
