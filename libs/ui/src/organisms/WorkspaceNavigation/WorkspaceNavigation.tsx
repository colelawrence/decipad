import { docs } from '@decipad/routing';
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
  readonly allNotebooksHref: string;
  readonly preferencesHref: string;
}
export const WorkspaceNavigation = ({
  allNotebooksHref,
  preferencesHref,
}: WorkspaceNavigationProps): ReturnType<FC> => {
  return (
    <nav css={styles}>
      <NavigationList>
        <NavigationItem exact href={allNotebooksHref} icon={<Folder />}>
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
        <NavigationItem href="https://discord.gg/HwDMqwbGmc" icon={<Chat />}>
          <span css={itemTextStyles}>Join our Discord</span>
        </NavigationItem>
      </NavigationList>
      <div role="presentation" css={{ padding: '3px 0' }}>
        <Divider />
      </div>
      <NavigationList>
        <NavigationItem href={preferencesHref} icon={<Settings />}>
          <span css={itemTextStyles}>Preferences</span>
        </NavigationItem>
      </NavigationList>
    </nav>
  );
};
