import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { HelpButton } from '../../molecules';
import { cssVar, smallestDesktop } from '../../primitives';

const crossBarsQuery = `@media (min-width: ${smallestDesktop.portrait.width}px)`;
const styles = css({
  height: '100%',

  position: 'relative',
  display: 'grid',
  gridTemplate: `
    "sidebar      " auto
    "topbar       " auto
    "notebook-list" auto
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
    overflow: 'hidden',
  },
});
const sidebarStyles = css({
  [crossBarsQuery]: {
    borderRight: `1px solid ${cssVar('highlightColor')}`,
  },
});
const helpStyles = css({
  position: 'absolute',
  right: '26px',
  [crossBarsQuery]: {
    bottom: '82px',
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
      <aside css={[{ gridArea: 'notebook-list' }, helpStyles]}>
        <HelpButton />
      </aside>
    </div>
  );
};
