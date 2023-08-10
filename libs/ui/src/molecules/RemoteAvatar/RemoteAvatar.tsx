/* eslint-disable no-underscore-dangle */
/* eslint decipad/css-prop-named-variable: 0 */
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
  image?: string;
  top: number;
  left: number;
  cursorColor: OpaqueColor;
}

export const RemoteAvatar: FC<RemoteAvatarProps> = ({
  name,
  image,
  top,
  left,
  cursorColor,
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
          zIndex: 3,
        },
      ]}
    >
      <Avatar
        name={name}
        imageHash={image}
        cursorColor={cursorColor}
        useSecondLetter={false}
      />
    </div>
  );
};
