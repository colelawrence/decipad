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
import { FC } from 'react';
import { ConnectDropTarget } from 'react-dnd';

interface DropZoneProps {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
}

export const DropZoneDetector: FC<DropZoneProps> = ({
  connectDropTarget,
  isOver,
}) => {
  return (
    <div
      css={[dropZoneWrapperStyles, isOver && isOverDropZoneStyles]}
      ref={connectDropTarget}
    >
      {isOver && (
        <div css={warningForDNDStyles}>
          <h1 css={css(p16Medium, { color: cssVar('backgroundColor') })}>
            Upload images or data
          </h1>
          <span css={css(p14Medium, { color: cssVar('weakerSlashIconColor') })}>
            .csv, .json, .gif, .jpg, 1MB max
          </span>
        </div>
      )}
      <div css={dropZoneBorderDetector} ref={connectDropTarget}></div>
    </div>
  );
};

const dropZoneWrapperStyles = css({
  position: 'fixed',
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
  top: 0,
  left: 0,
  width: '100%',
});
