/* eslint-disable no-underscore-dangle */
import { Avatar } from '@decipad/ui';
import { css } from '@emotion/react';
import { FC } from 'react';
import { OpaqueColor, shortAnimationDuration } from '../../primitives';
import { slimBlockWidth } from '../../styles/editor-layout';

const avatarSize = '30px';
const avatarMarginLeft = '5px';

const remoteAvatarStyles = css({
  position: 'absolute',
  width: avatarSize,
  height: avatarSize,
  transition: `top ${shortAnimationDuration} ease-in-out`,
});

interface RemoteAvatarProps {
  name: string;
  email?: string;
  top: number;
  left: number;
  backgroundColor: OpaqueColor;
}

export const RemoteAvatar: FC<RemoteAvatarProps> = ({
  name,
  email,
  top,
  left,
  backgroundColor,
}) => {
  const rightDisplacement = Math.max(
    Math.min(left, slimBlockWidth) - slimBlockWidth,
    0
  );
  return (
    <div
      css={[
        remoteAvatarStyles,
        {
          top: `${top}px`,
          right: `calc((-${avatarSize} - ${avatarMarginLeft} - ${rightDisplacement}px))`,
        },
      ]}
    >
      <Avatar name={name} email={email} backgroundColor={backgroundColor} />
    </div>
  );
};
