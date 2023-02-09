import { useDelayedTrue } from '@decipad/react-utils';
import {
  black,
  cssVar,
  mediumShadow,
  p14Medium,
  p16Medium,
  strongOpacity,
  transparency,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { FC, useEffect, useState } from 'react';
import { ConnectDropTarget } from 'react-dnd';

const dropZoneBorderDetectorThickness = '10px';

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
      {!initializing && !isNotOver && (
        <div css={warningForDNDStyles}>
          <h1 css={css(p16Medium, { color: cssVar('backgroundColor') })}>
            Upload images or data
          </h1>
          <span css={css(p14Medium, { color: cssVar('weakerSlashIconColor') })}>
            .csv, .json, .gif, .jpg, 1MB max
          </span>
        </div>
      )}
      <div css={dropZoneTopBorderDetectorTop} ref={connectDropTarget}></div>
      <div css={dropZoneTopBorderDetectorBottom} ref={connectDropTarget}></div>
      <div css={dropZoneTopBorderDetectorLeft} ref={connectDropTarget}></div>
      <div css={dropZoneTopBorderDetectorRight} ref={connectDropTarget}></div>
    </div>
  );
};

const dropZoneWrapperStyles = css({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100vh',
  width: '100%',
});

const warningForDNDStyles = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  backgroundColor: cssVar('strongSlashIconColor'),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px 50px',
  gap: 4,
  borderRadius: 16,
  isolation: 'isolate',
});

const isOverDropZoneStyles = css({
  zIndex: 3,
  backgroundColor: transparency(black, strongOpacity).rgba,
  boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
});

const dropZoneBorderDetector = css({
  position: 'absolute',
  zIndex: 3,
});

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
