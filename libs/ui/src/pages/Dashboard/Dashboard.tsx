import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, smallestDesktop } from '../../primitives';

const crossBarsQuery = `@media (min-width: ${smallestDesktop.portrait.width}px)`;
const styles = css({
  // Do not scroll as a whole. The notebook list will scroll individually.
  height: 0,
  minHeight: '100%',

  position: 'relative',
  display: 'grid',
  gridTemplate: `
    "sidebar      " max-content
    "topbar       " max-content
    "notebook-list" minmax(200px, auto)
    /1fr
  `,
  [crossBarsQuery]: {
    gridTemplate: `
      "sidebar topbar       " auto
      "sidebar notebook-list" 1fr
      /272px   1fr
    `,
  },

  '> *': {
    display: 'grid',
  },
});
const sidebarStyles = css({
  [crossBarsQuery]: {
    borderRight: `1px solid ${cssVar('highlightColor')}`,
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
      <main css={{ gridArea: 'notebook-list', overflowY: 'auto' }}>
        {notebookList}
      </main>
      <header css={{ gridArea: 'topbar' }}>{topbar}</header>
      <aside css={[{ gridArea: 'sidebar' }, sidebarStyles]}>{sidebar}</aside>
    </div>
  );
};
