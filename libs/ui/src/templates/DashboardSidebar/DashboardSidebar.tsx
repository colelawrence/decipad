import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { WorkspaceSwitcher } from '../../organisms';
import { smallestDesktop } from '../../primitives';
import { dashboard } from '../../styles';

const mobileQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const styles = css({
  padding: `${dashboard.topPadding} 24px 56px`,

  display: 'grid',
  gridTemplateRows: '[switcher] auto [navigation] 1fr',
  rowGap: '20px',
  [mobileQuery]: {
    padding: `${dashboard.topPadding} 24px 0px`,
  },
});

type DashboardSidebarProps = ComponentProps<typeof WorkspaceSwitcher> & {
  readonly onPointerEnter?: () => void;
};

export const DashboardSidebar = ({
  onPointerEnter,
  ...props
}: DashboardSidebarProps): ReturnType<FC> => {
  return (
    <div css={styles} onPointerEnter={onPointerEnter}>
      <div css={{ gridRow: 'navigation', display: 'grid' }}>
        {/* Leaving this here in case we want to add other items in the future */}
      </div>
      <div css={{ gridRow: 'switcher', display: 'grid' }}>
        <WorkspaceSwitcher {...props} />
      </div>
    </div>
  );
};
