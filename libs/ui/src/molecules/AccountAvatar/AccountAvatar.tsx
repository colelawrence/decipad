/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { nanoid } from 'nanoid';
import { ComponentProps, useState } from 'react';

import { noop } from '@decipad/utils';
import { Avatar } from '../../atoms';
import { Chevron } from '../../icons';
import {
  cssVar,
  p12Medium,
  setCssVar,
  shortAnimationDuration,
} from '../../primitives';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

const avatarGridStyles = css(p12Medium, {
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: '28px',
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

type AccountAvatarProps = Pick<
  ComponentProps<typeof Avatar>,
  'name' | 'email'
> & {
  readonly menuOpen: boolean;
  readonly variant?: boolean;
  readonly onClick?: () => void;
};

export const AccountAvatar = ({
  menuOpen,
  onClick = noop,
  variant = false,
  ...props
}: AccountAvatarProps): ReturnType<React.FC> => {
  const [hoverTargetClassName] = useState(`account-avatar-${nanoid()}`);
  const hoverSelector = menuOpen ? '' : `.${hoverTargetClassName}:hover`;
  const onAccountAvatarClick = useEventNoEffect(onClick);
  return (
    <button
      onClick={onAccountAvatarClick}
      className={hoverTargetClassName}
      css={avatarGridStyles}
    >
      <Avatar hoverSelector={hoverSelector} {...props} />

      {variant && (
        <div css={chevronStyles(hoverSelector)}>
          <Chevron type={menuOpen ? 'collapse' : 'expand'} />
        </div>
      )}
    </button>
  );
};
