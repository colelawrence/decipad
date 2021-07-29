import { css } from '@emotion/react';
import { ComponentProps, useState } from 'react';

import { Button } from '../../atoms';
import { NotebookListHeader, AccountAvatar } from '../../molecules';
import { AccountMenu } from '../../organisms';
import { smallestDesktop, smallestMobile } from '../../primitives';
import { noop, viewportCalc } from '../../utils';

const styles = css({
  padding: `${viewportCalc(
    smallestMobile,
    20,
    smallestDesktop,
    36,
    'px',
    'vmax'
  )} ${viewportCalc(
    smallestMobile,
    20,
    smallestDesktop,
    48,
    'px',
    'vw'
  )} ${viewportCalc(smallestMobile, 12, smallestDesktop, 20, 'px', 'vmax')}`,

  display: 'flex',
  justifyContent: 'space-between',
  columnGap: '32px',

  flexWrap: 'wrap-reverse',
  rowGap: '32px',
});
const leftStyles = css({
  flexGrow: 9999,

  display: 'grid',
  alignItems: 'end',
});
const rightStyles = css({
  flexGrow: 1,

  display: 'grid',
  gridAutoFlow: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  columnGap: '16px',
});

type DashboardTopbarProps = Pick<
  ComponentProps<typeof NotebookListHeader>,
  'numberOfNotebooks'
> &
  Pick<ComponentProps<typeof AccountAvatar>, 'name'> &
  ComponentProps<typeof AccountMenu> & {
    readonly onCreateNotebook?: () => void;
  };

export const DashboardTopbar = ({
  numberOfNotebooks,

  onCreateNotebook = noop,

  name,
  email,
  onLogout,
}: DashboardTopbarProps): ReturnType<React.FC> => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header css={styles}>
      <div css={leftStyles}>
        <NotebookListHeader
          Heading="h1"
          numberOfNotebooks={numberOfNotebooks}
        />
      </div>
      <div css={rightStyles}>
        <Button primary extraSlim onClick={onCreateNotebook}>
          Create New
        </Button>
        <div css={{ position: 'relative' }}>
          <AccountAvatar
            menuOpen={menuOpen}
            name={name}
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div
              css={{
                position: 'absolute',
                width: 'max-content',
                maxWidth: '50vw',
                top: 'calc(100% + 8px)',
                right: 0,
              }}
            >
              <AccountMenu name={name} email={email} onLogout={onLogout} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
