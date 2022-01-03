import { nanoid } from 'nanoid';
import { ComponentProps, useState } from 'react';
import { css } from '@emotion/react';

import { Avatar } from '../../atoms';
import { noop } from '../../utils';
import { Chevron } from '../../icons';
import {
  cssVar,
  p12Bold,
  setCssVar,
  shortAnimationDuration,
} from '../../primitives';

const styles = css(p12Bold, {
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: '28px 6px',
  columnGap: '6px',
});

const chevronStyles = (hoverSelector: string) =>
  css(setCssVar('currentTextColor', cssVar('weakTextColor')), {
    width: '8px',
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
  const [hoverTargetClassName] = useState(`account-avatar-${nanoid()}`);
  const hoverSelector = menuOpen ? '' : `.${hoverTargetClassName}:hover`;
  return (
    <button onClick={onClick} className={hoverTargetClassName} css={styles}>
      <Avatar hoverSelector={hoverSelector} {...props} />
      <div css={chevronStyles(hoverSelector)}>
        <Chevron type={menuOpen ? 'collapse' : 'expand'} />
      </div>
    </button>
  );
};
