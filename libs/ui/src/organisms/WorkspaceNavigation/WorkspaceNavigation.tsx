import { docs, workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Divider, NavigationItem } from '../../atoms';
import { Chat, Docs, Folder, Settings } from '../../icons';
import { NavigationList } from '../../molecules';

const styles = css({
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto auto auto',
});

const itemTextStyles = css({ padding: '8px 0' });

interface WorkspaceNavigationProps {
  readonly activeWorkspace: { readonly id: string };
}
export const WorkspaceNavigation = ({
  activeWorkspace,
}: WorkspaceNavigationProps): ReturnType<FC> => {
  const activeWorkspaceRoute = workspaces({}).workspace({
    workspaceId: activeWorkspace.id,
  });
  return (
    <nav css={styles}>
      <NavigationList>
        <NavigationItem exact href={activeWorkspaceRoute.$} icon={<Folder />}>
          <span css={itemTextStyles}>All Notebooks</span>
        </NavigationItem>
      </NavigationList>
      <div role="presentation" css={{ padding: '12px 0' }}>
        <Divider />
      </div>
      <NavigationList>
        <NavigationItem href={docs({}).$} icon={<Docs />}>
          <span css={itemTextStyles}>Check the docs</span>
        </NavigationItem>
        <NavigationItem
          href="https://discord.com/invite/YT2cuJkHkS"
          icon={<Chat />}
        >
          <span css={itemTextStyles}>Join our Discord</span>
        </NavigationItem>
      </NavigationList>
      <div role="presentation" css={{ padding: '3px 0' }}>
        <Divider />
      </div>
      <NavigationList>
        <NavigationItem
          href={activeWorkspaceRoute.edit({}).$}
          icon={<Settings />}
        >
          <span css={itemTextStyles}>Preferences</span>
        </NavigationItem>
      </NavigationList>
    </nav>
  );
};
