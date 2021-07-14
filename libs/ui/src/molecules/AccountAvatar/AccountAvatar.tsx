import { ComponentProps } from 'react';
import { css } from '@emotion/react';

import { Avatar } from '../../atoms';
import { noop } from '../../utils';
import { Caret } from '../../icons';

const styles = css({
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: '28px 6px',
  columnGap: '6px',
});

type AccountAvatarProps = Pick<ComponentProps<typeof Avatar>, 'userName'> & {
  readonly menuOpen: boolean;
  readonly onClick?: () => void;
};

export const AccountAvatar = ({
  menuOpen,
  onClick = noop,
  ...props
}: AccountAvatarProps): ReturnType<React.FC> => {
  return (
    <button onClick={onClick} css={styles}>
      <Avatar {...props} />
      <Caret type={menuOpen ? 'collapse' : 'expand'} />
    </button>
  );
};
