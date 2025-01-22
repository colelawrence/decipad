/* eslint decipad/css-prop-named-variable: 0 */
import { RefObject, useEffect, useRef } from 'react';
import type { XYCoord } from 'react-dnd';
import { css } from '@emotion/react';
import { slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import { cssVar } from 'libs/ui/src/primitives';

export interface DraggableBlockOverlayProps {
  previewHtmlRef: RefObject<HTMLDivElement>;
  position: XYCoord;
}

export const DraggableBlockOverlay = ({
  previewHtmlRef,
  position,
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
    <div css={wrapperStyles}>
      <div
        // https://emotion.sh/docs/best-practices#use-the-style-prop-for-dynamic-styles
        style={{
          transform: `translate(${position.x - 64}px, ${position.y}px)`,
        }}
      >
        <div css={innerStyles}>
          <div
            className="drag-preview"
            ref={ref}
            dangerouslySetInnerHTML={{
              __html: previewHtmlRef.current?.outerHTML!,
            }}
            css={dragPreviewStyles}
          />
        </div>
      </div>
    </div>
  );
};

const wrapperStyles = css({
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 2000,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
});

const innerStyles = css({
  transform: 'rotate(1deg)',
  transformOrigin: '0 0',
});

const dragPreviewStyles = css({
  display: 'grid',
  gridTemplateColumns: `64px 1fr ${slimBlockWidth}px 1fr 64px`,
  width: cssVar('editorWidth'),
});
