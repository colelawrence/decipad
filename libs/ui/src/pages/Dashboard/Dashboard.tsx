import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, smallestDesktop } from '../../primitives';

const styles = css({
  height: '100%',

  display: 'grid',
  gridTemplate: `
    "sidebar      " auto
    "topbar       " auto
    "notebook-list" auto
    /1fr
  `,
  [`@media (min-width: ${smallestDesktop.portrait.width}px)`]: {
    gridTemplate: `
      "sidebar topbar       " auto
      "sidebar notebook-list" 1fr
      /272px   1fr
    `,

    '> aside': {
      borderRight: `1px solid ${cssVar('highlightColor')}`,
    },
  },

  '> *': {
    display: 'grid',
  },
});

interface DashboardProps {
  readonly sidebar: ReactNode;
  readonly topbar: ReactNode;
  readonly notebookList: ReactNode;
}
export const Dashboard = ({
  sidebar,
  topbar,
  notebookList,
}: DashboardProps): ReturnType<FC> => {
  return (
    <div css={styles}>
      <main css={{ gridArea: 'notebook-list' }}>{notebookList}</main>
      <header css={{ gridArea: 'topbar' }}>{topbar}</header>
      <aside css={{ gridArea: 'sidebar' }}>{sidebar}</aside>
    </div>
  );
};
