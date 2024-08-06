// DragArea.tsx
import { css } from '@emotion/react';
import { cssVar, cssVarHex, transparencyHex } from 'libs/ui/src/primitives';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  dndLabelHeadingStyles,
  dndLabelTextStyles,
  uploadingButtonPlaceholderStyles,
} from './styles';
import { DragAreaProps } from './types';
import { useFileDrop } from './useFileDrop';
import { Add } from 'libs/ui/src/icons';
import { droppablePatternStyles } from 'libs/ui/src/styles/droppablePattern';

const weakestColor = transparencyHex(cssVarHex('backgroundHeavier'), 0.08);
const weakColor = transparencyHex(cssVarHex('backgroundHeavier'), 0.2);
const strongColor = transparencyHex(cssVarHex('backgroundHeavier'), 0.4);

const DragArea = ({
  processFile,
  acceptHuman,
  fileType,
  maxSize,
  uploadProgress,
}: DragAreaProps) => {
  const [{ isOver, canDrop }, dropRef] = useFileDrop(processFile);
  const dropFileWrapperStyles = [
    uploadingButtonPlaceholderStyles({
      uploadProgress,
    }),
    canDrop && droppablePatternStyles(weakColor, weakestColor),
    canDrop &&
      isOver &&
      css({
        backgroundColor: strongColor,
      }),
  ];
  const dndTextAreaStyles = [
    dndLabelHeadingStyles,
    isOver && { color: cssVar('textSubdued') },
  ];
  const dndTextDescStyles = [
    dndLabelTextStyles,
    isOver && { color: cssVar('textSubdued') },
  ];

  return (
    <div ref={dropRef} css={dropFileWrapperStyles}>
      <DndProvider backend={HTML5Backend}>
        {!uploadProgress && (
          <>
            <div css={dndTextAreaStyles}>
              <span>
                <Add />
              </span>
              <span>{`Drag and drop your ${fileType} here`}</span>
            </div>
            <div css={dndTextDescStyles}>
              {`Upload a ${
                acceptHuman && Array.isArray(acceptHuman)
                  ? acceptHuman.join(', ')
                  : fileType
              } file`}
              {maxSize &&
                !isNaN(maxSize) &&
                typeof maxSize === 'number' &&
                ` smaller than ${Math.round(maxSize / 1_000_000)}MB`}
            </div>
          </>
        )}
      </DndProvider>
    </div>
  );
};

export default DragArea;
