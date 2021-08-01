import { css } from '@emotion/react';
import { ComponentProps } from 'react';
import { WorkspaceNavigation, WorkspaceSwitcher } from '../../organisms';

const styles = css({
  padding: `20px 24px 56px`,

  display: 'grid',
  gridTemplateRows: '[switcher] auto [navigation] 1fr',
  rowGap: '20px',
});

type DashboardSidebarProps = ComponentProps<typeof WorkspaceSwitcher> &
  ComponentProps<typeof WorkspaceNavigation>;

export const DashboardSidebar = (props: DashboardSidebarProps) => {
  return (
    <div css={styles}>
      <div css={{ gridRow: 'navigation', display: 'grid' }}>
        <WorkspaceNavigation {...props} />
      </div>
      <div css={{ gridRow: 'switcher', display: 'grid' }}>
        <WorkspaceSwitcher {...props} />
      </div>
    </div>
  );
};
