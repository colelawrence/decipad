import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, useCallback, useState } from 'react';
import { Button } from '../../atoms';
import { AccountAvatar, NotebookListHeader } from '../../molecules';
import { AccountMenu } from '../../organisms';
import { cssVar, smallestDesktop } from '../../primitives';
import { dashboard, notebookList } from '../../styles';

const mobileQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const styles = css({
  padding: `
    ${dashboard.topPadding}
    ${notebookList.horizontalPadding}
  `,

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
  [mobileQuery]: {
    backgroundColor: cssVar('highlightColor'),
    padding: '16px 16.5px',
    boxShadow: `0px 0px 0px 12px ${cssVar('highlightColor')}`,
    borderRadius: '6px',
  },
});
const rightStyles = css({
  flexGrow: 1,

  display: 'grid',
  gridAutoFlow: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  columnGap: '16px',
  [mobileQuery]: {
    display: 'none',
  },
});

type DashboardTopbarProps = Pick<
  ComponentProps<typeof NotebookListHeader>,
  'numberOfNotebooks'
> &
  Pick<ComponentProps<typeof AccountAvatar>, 'name'> &
  ComponentProps<typeof AccountMenu> & {
    readonly onCreateNotebook?: () => void;

    readonly onPointerEnter?: () => void;
  };

export const DashboardTopbar = ({
  numberOfNotebooks,

  onCreateNotebook = noop,

  name,
  email,
  onLogout,

  onPointerEnter,
}: DashboardTopbarProps): ReturnType<React.FC> => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenuOpen = useCallback(() => setMenuOpen((o) => !o), []);

  return (
    <div css={styles} onPointerEnter={onPointerEnter}>
      <div css={leftStyles}>
        <NotebookListHeader
          Heading="h1"
          numberOfNotebooks={numberOfNotebooks}
        />
      </div>
      <div css={rightStyles}>
        <Button type="primary" size="extraSlim" onClick={onCreateNotebook}>
          Create Notebook
        </Button>
        <div css={{ position: 'relative' }}>
          <AccountAvatar
            menuOpen={menuOpen}
            name={name}
            onClick={toggleMenuOpen}
          />
          {menuOpen && (
            <div
              css={{
                position: 'absolute',
                minWidth: '120px',
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
    </div>
  );
};
