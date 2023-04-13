import { css } from '@emotion/react';
import { NotebookAvatar } from '../../molecules/NotebookAvatars/NotebookAvatars';
import { ellipsis, p12Medium, p14Medium } from '../../primitives';
import { Avatar } from '..';

export const CollabMember: React.FC<{ avatar: NotebookAvatar }> = ({
  avatar: { user },
}) => {
  return (
    <>
      <div css={avatarStyles}>
        <Avatar name={user.name} email={user.email || ''} />
      </div>
      {user.email === user.name ? (
        <div css={userDetailsStyles}>
          <div css={css(p12Medium, ellipsis)} title={user.email ?? undefined}>
            {user.email}
          </div>
        </div>
      ) : (
        <div css={userDetailsStyles}>
          <div css={css(p14Medium, ellipsis)} title={user.name}>
            {user.name}
          </div>
          <div css={css(p12Medium, ellipsis)} title={user.email ?? undefined}>
            {user.email}
          </div>
        </div>
      )}
    </>
  );
};

const avatarStyles = css({
  width: '28px',
  height: '28px',
});

const userDetailsStyles = css({
  flex: 1,
  minWidth: 0,
});
