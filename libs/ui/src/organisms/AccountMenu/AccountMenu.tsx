import { css } from '@emotion/react';
import { FC } from 'react';

import { noop } from '@decipad/utils';
import { Divider, NavigationItem } from '../../atoms';
import { Logout } from '../../icons';
import { NavigationList } from '../../molecules';
import { cssVar, p14Medium, p12Regular } from '../../primitives';

const styles = css({
  display: 'grid',
  rowGap: '4px',

  padding: '16px',
  paddingBottom: '8px',

  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
  boxShadow: `3px 3px 24px ${cssVar('highlightColor')}`,
});

const textStyles = css({
  overflow: 'hidden',
});

export interface AccountMenuProps {
  readonly onLogout?: () => void;
  readonly name: string;
  readonly email: string;
}

export const AccountMenu = ({
  name,
  email,
  onLogout = noop,
}: AccountMenuProps): ReturnType<FC> => {
  return (
    <nav css={styles}>
      <strong css={css(p14Medium, textStyles)}>{name}</strong>
      <address css={css(p12Regular, textStyles)}>{email}</address>
      <div css={{ paddingTop: '12px', paddingBottom: '4px' }}>
        <Divider />
      </div>
      <NavigationList>
        <NavigationItem icon={<Logout />} onClick={onLogout}>
          Log out
        </NavigationItem>
      </NavigationList>
    </nav>
  );
};
