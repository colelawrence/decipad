import { css } from '@emotion/react';
import { FC } from 'react';
import { Avatar, NotebookTopbarTooltip } from '../../atoms';
import { white } from '../../primitives';

const avatarStyles = css({
  width: '28px',
  height: '28px',
  display: 'inline-block',
  marginLeft: '-6px',
  borderRadius: '100vmax',
  border: `1px solid ${white.rgb}`,
});

interface NotebookAvatarProps {
  name: string;
  permission: string;
  visible?: boolean;
}

export const NotebookAvatar = ({
  name,
  permission,
  visible = undefined,
}: NotebookAvatarProps): ReturnType<FC> => {
  return (
    <NotebookTopbarTooltip
      name={name}
      permission={permission}
      visible={visible}
    >
      <div css={avatarStyles}>
        <Avatar name={name} greyedOut={permission !== 'ADMIN'} />
      </div>
    </NotebookTopbarTooltip>
  );
};
