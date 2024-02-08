/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, smallScreenQuery } from '../../../primitives';
import { deciOverflowYStyles } from '../../../styles/scrollbars';

const styles = css({
  // Do not scroll as a whole. The notebook list will scroll individually.
  height: 0,
  minHeight: '100%',
  position: 'relative',
  display: 'grid',
  padding: 16,
  gap: 16,
  gridTemplateColumns: '256px auto',
  gridTemplateRows: 'auto',
  gridTemplateAreas: `
    'sidebar main'
    'sidebar main'
  `,
  backgroundColor: cssVar('backgroundDefault'),

  [smallScreenQuery]: {
    padding: 0,
    gap: 0,
    gridTemplateColumns: 'auto',
    gridTemplateRows: 'auto auto',
    gridTemplateAreas: `
      'main main'
      'main main'
    `,
  },
});

const mainStyles = css(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    backgroundColor: cssVar('backgroundMain'),
    borderRadius: 16,
  },
  deciOverflowYStyles
);

const sidebarStyles = css({
  [smallScreenQuery]: {
    position: 'fixed',
    left: 16,
    top: 16,
  },
});

interface DashboardProps {
  readonly SidebarComponent: ReactNode;
  // We'll need this in future, but right now we pass null
  readonly MetaComponent: ReactNode;
  readonly children: ReactNode | ReactNode[];
}

export const Dashboard = ({
  SidebarComponent,
  children,
}: DashboardProps): ReturnType<FC> => {
  return (
    <div css={styles} data-testid="dashboard" vaul-drawer-wrapper="">
      <nav css={[{ gridArea: 'sidebar' }, sidebarStyles]}>
        {SidebarComponent}
      </nav>
      <main css={[{ gridArea: 'main' }, mainStyles]}>{children}</main>
    </div>
  );
};
