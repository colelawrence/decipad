import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { WorkspaceNavigation, WorkspaceSwitcher } from '../../organisms';

const styles = css({
  padding: `20px 24px 56px`,

  display: 'grid',
  gridTemplateRows: '[switcher] auto [navigation] 1fr',
  rowGap: '20px',
});

type DashboardSidebarProps = ComponentProps<typeof WorkspaceSwitcher> &
  ComponentProps<typeof WorkspaceNavigation>;

export const DashboardSidebar = (
  props: DashboardSidebarProps
): ReturnType<FC> => {
  return (
    <aside css={styles}>
      <div css={{ gridRow: 'navigation', display: 'grid' }}>
        <WorkspaceNavigation {...props} />
      </div>
      <div css={{ gridRow: 'switcher', display: 'grid' }}>
        <WorkspaceSwitcher {...props} />
      </div>
    </aside>
  );
};
