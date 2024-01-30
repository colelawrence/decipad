import { css } from '@emotion/react';
import { Avatar } from '..';
import { ellipsis, p12Medium, p14Medium } from '../../../primitives';
import { UserAccessMetaFragment } from '@decipad/graphql-client';

export const CollabMember: React.FC<{ avatar: UserAccessMetaFragment }> = ({
  avatar: { user },
}) => {
  return user ? (
    <>
      <div css={avatarStyles}>
        <Avatar
          name={user.name}
          imageHash={user.image}
          useSecondLetter={false}
        />
      </div>
      {user.email === user.name ? (
        <div css={userDetailsStyles}>
          <div css={smallTextStyles} title={user.email ?? undefined}>
            {user.email}
          </div>
        </div>
      ) : (
        <div css={userDetailsStyles}>
          <div css={mediumTextStyles} title={user.name}>
            {user.name}
          </div>
          <div css={smallTextStyles} title={user.email ?? undefined}>
            {user.email}
          </div>
        </div>
      )}
    </>
  ) : null;
};

const avatarStyles = css({
  width: '28px',
  height: '28px',
});

const userDetailsStyles = css({
  maxWidth: 225,
  flex: '1 0 auto',
  minWidth: 0,
});

const smallTextStyles = css(p12Medium, ellipsis, {
  maxWidth: '18ch',
});

const mediumTextStyles = css(p14Medium, ellipsis, {
  maxWidth: '18ch',
});
