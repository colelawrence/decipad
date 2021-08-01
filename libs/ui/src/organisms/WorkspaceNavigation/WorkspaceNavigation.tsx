import { css } from '@emotion/react';
import { Divider, NavigationItem } from '../../atoms';
import { Folder, Globe, Settings } from '../../icons';
import { NavigationList } from '../../molecules';
import { cssVar, p14Regular, setCssVar } from '../../primitives';

const styles = css({
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  rowGap: '24px',
});

const itemTextStyles = css(
  p14Regular,
  setCssVar('currentTextColor', cssVar('strongTextColor')),
  { padding: '8px 0' }
);

interface WorkspaceNavigationProps {
  readonly allNotebooksHref: string;
  readonly preferencesHref: string;
}
export const WorkspaceNavigation = ({
  allNotebooksHref,
  preferencesHref,
}: WorkspaceNavigationProps) => {
  return (
    <nav css={styles}>
      <NavigationList>
        <NavigationItem href={allNotebooksHref} icon={<Folder />}>
          <span css={itemTextStyles}>All Notebooks</span>
        </NavigationItem>
      </NavigationList>
      <Divider />
      <NavigationList>
        <NavigationItem href="https://discord.gg/UaJhZdqc" icon={<Globe />}>
          <span css={itemTextStyles}>Explore community</span>
        </NavigationItem>
        <NavigationItem href={preferencesHref} icon={<Settings />}>
          <span css={itemTextStyles}>Preferences</span>
        </NavigationItem>
      </NavigationList>
    </nav>
  );
};
