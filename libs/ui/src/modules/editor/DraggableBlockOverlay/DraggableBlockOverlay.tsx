/* eslint decipad/css-prop-named-variable: 0 */
import { RefObject, useEffect, useRef } from 'react';
import { DragHandle } from '../../../icons';
import { handleStyle } from '../BlockDragHandle/BlockDragHandle';
import type { XYCoord } from 'react-dnd';

export interface DraggableBlockOverlayProps {
  previewHtmlRef: RefObject<HTMLDivElement>;
  position: XYCoord;
  showDragHandle: boolean;
}

export const DraggableBlockOverlay = ({
  previewHtmlRef,
  position,
  showDragHandle,
}: DraggableBlockOverlayProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Canvas content needs to be copied over manually
  useEffect(() => {
    const source = previewHtmlRef.current;
    const target = ref.current;
    if (!source || !target) return;

    const sourceCanvases = source.querySelectorAll('canvas');
    const targetCanvases = target.querySelectorAll('canvas');

    if (sourceCanvases.length !== targetCanvases.length) {
      throw new Error('Source should have same number of canvases as target');
    }

    for (let i = 0; i < sourceCanvases.length; i++) {
      const sourceCanvas = sourceCanvases[i];
      const targetCanvas = targetCanvases[i];

      const targetContext = targetCanvas.getContext('2d');
      if (!targetContext) continue;

      targetContext.drawImage(sourceCanvas, 0, 0);
    }
  }, [ref, previewHtmlRef]);

  return (
    <div
      css={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 2000,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        // https://emotion.sh/docs/best-practices#use-the-style-prop-for-dynamic-styles
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <div
          css={{
            display: 'flex',
            alignItems: 'start',
            gap: 16,
            transform: 'rotate(1deg)',
            transformOrigin: '0 0',
          }}
        >
          <div
            css={[
              handleStyle,
              {
                marginTop: 'calc((1.5rem - 1.125rem) / 2)',
                visibility: showDragHandle ? 'visible' : 'hidden',
              },
            ]}
          >
            <DragHandle />
          </div>

          <div
            ref={ref}
            dangerouslySetInnerHTML={{
              __html: previewHtmlRef.current?.innerHTML ?? '',
            }}
            style={{ width: previewHtmlRef.current?.clientWidth ?? 0 }}
          />
        </div>
      </div>
    </div>
  );
};
