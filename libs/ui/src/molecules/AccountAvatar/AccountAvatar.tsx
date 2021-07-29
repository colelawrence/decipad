import { v4 as uuidV4 } from 'uuid';
import { ComponentProps, useState } from 'react';
import { css } from '@emotion/react';

import { Avatar } from '../../atoms';
import { noop } from '../../utils';
import { Caret } from '../../icons';
import { p12Bold, shortAnimationDuration } from '../../primitives';

const styles = css(p12Bold, {
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: '28px 6px',
  columnGap: '6px',
});

const caretStyles = (hoverSelector: string) =>
  css({
    transition: `padding-top ease-in-out ${shortAnimationDuration}`,
    [`${hoverSelector} &`]: {
      paddingTop: '4px',
    },
  });

type AccountAvatarProps = Pick<ComponentProps<typeof Avatar>, 'name'> & {
  readonly menuOpen: boolean;
  readonly onClick?: () => void;
};

export const AccountAvatar = ({
  menuOpen,
  onClick = noop,
  ...props
}: AccountAvatarProps): ReturnType<React.FC> => {
  const [hoverTargetClassName] = useState(`account-avatar-${uuidV4()}`);
  const hoverSelector = menuOpen ? '' : `.${hoverTargetClassName}:hover`;
  return (
    <button onClick={onClick} className={hoverTargetClassName} css={styles}>
      <Avatar hoverSelector={hoverSelector} {...props} />
      <div css={caretStyles(hoverSelector)}>
        <Caret type={menuOpen ? 'collapse' : 'expand'} />
      </div>
    </button>
  );
};
