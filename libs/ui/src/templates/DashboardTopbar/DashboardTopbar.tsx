import { css } from '@emotion/react';
import { ComponentProps } from 'react';

import { Button } from '../../atoms';
import { NotebookListHeader, AccountAvatar } from '../../molecules';
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
const rightStyles = css({
  display: 'flex',
  alignItems: 'center',
  columnGap: '16px',

  flexWrap: 'wrap-reverse',
  rowGap: '20px',
});

type DashboardTopbarProps = Pick<
  ComponentProps<typeof NotebookListHeader>,
  'numberOfNotebooks'
> &
  Pick<ComponentProps<typeof AccountAvatar>, 'userName'> & {
    readonly onCreateNotebook?: () => void;
  };

export const DashboardTopbar = ({
  numberOfNotebooks,

  onCreateNotebook = noop,

  userName,
}: DashboardTopbarProps): ReturnType<React.FC> => {
  return (
    <header css={styles}>
      <NotebookListHeader Heading="h1" numberOfNotebooks={numberOfNotebooks} />
      <div css={rightStyles}>
        <Button primary extraSlim onClick={onCreateNotebook}>
          Create New
        </Button>
        <AccountAvatar menuOpen={false} userName={userName} />
      </div>
    </header>
  );
};
