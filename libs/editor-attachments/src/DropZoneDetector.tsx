import { FC, useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { ConnectDropTarget } from 'react-dnd';
import { useDelayedTrue } from '@decipad/react-utils';
import { cssVar } from '@decipad/ui';

const dropZoneWrapperStyles = css({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100vh',
  width: '100%',
});

const isOverDropZoneStyles = css({
  zIndex: 3,
  borderWidth: '10px',
  borderStyle: 'solid',
  borderColor: cssVar('droplineColor'),
});

const dropZoneBorderDetector = css({
  position: 'absolute',
  zIndex: 3,
});

const dropZoneBorderDetectorThickness = '20px';

const dropZoneTopBorderDetectorTop = css(dropZoneBorderDetector, {
  top: 0,
  width: '100%',
  height: dropZoneBorderDetectorThickness,
});

const dropZoneTopBorderDetectorBottom = css(dropZoneBorderDetector, {
  bottom: 0,
  width: '100%',
  height: dropZoneBorderDetectorThickness,
});

const dropZoneTopBorderDetectorLeft = css(dropZoneBorderDetector, {
  left: 0,
  height: '100vh',
  width: dropZoneBorderDetectorThickness,
});

const dropZoneTopBorderDetectorRight = css(dropZoneBorderDetector, {
  right: 0,
  height: '100vh',
  width: dropZoneBorderDetectorThickness,
});

interface DropZoneProps {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
}

export const DropZoneDetector: FC<DropZoneProps> = ({
  connectDropTarget,
  isOver,
}) => {
  const isNotOver = useDelayedTrue(!isOver);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setInitializing(false);
    }, 2_000);

    return () => clearTimeout(timeout);
  }, [isNotOver]);

  return (
    <div
      css={[
        dropZoneWrapperStyles,
        !initializing && !isNotOver && isOverDropZoneStyles,
      ]}
      ref={connectDropTarget}
    >
      <div css={dropZoneTopBorderDetectorTop} ref={connectDropTarget}></div>
      <div css={dropZoneTopBorderDetectorBottom} ref={connectDropTarget}></div>
      <div css={dropZoneTopBorderDetectorLeft} ref={connectDropTarget}></div>
      <div css={dropZoneTopBorderDetectorRight} ref={connectDropTarget}></div>
    </div>
  );
};
