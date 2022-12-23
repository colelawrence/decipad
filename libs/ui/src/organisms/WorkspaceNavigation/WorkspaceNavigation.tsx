import { isFlagEnabled } from '@decipad/feature-flags';
import { useThemeFromStore } from '@decipad/react-contexts';
import { docs, workspaces } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Divider, NavigationItem } from '../../atoms';
import { Dot } from '../../atoms/Dot/Dot';
import {
  Archive,
  Chat,
  Docs,
  Folder,
  FolderCross,
  Globe,
  Settings,
} from '../../icons';
import { NavigationList } from '../../molecules';
import { cssVar, p13Medium } from '../../primitives';
import { swatchesThemed, swatchNames } from '../../utils';

const workspaceNavContainerStyles = (flagEnabled: boolean) =>
  css({
    display: 'grid',
    gridTemplateRows: `auto ${
      flagEnabled ? 'auto auto' : ''
    } auto 1fr auto auto auto`,
  });

const itemTextStyles = css({ padding: '8px 0' });
const hrStyles = css({
  padding: '12px 0',
  transform: 'translateX(-15px)',
  width: 'calc(100% + 30px)',
  hr: {
    boxShadow: `0 0 0 0.5px ${cssVar('borderColor')}`,
  },
});

interface WorkspaceNavigationProps {
  readonly activeWorkspace: { readonly id: string };
}
export const WorkspaceNavigation = ({
  activeWorkspace,
}: WorkspaceNavigationProps): ReturnType<FC> => {
  const activeWorkspaceRoute = workspaces({}).workspace({
    workspaceId: activeWorkspace.id,
  });
  const sectionsEnabled = isFlagEnabled('COLOR_SIDEBAR') && false;
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);
  return (
    <nav css={workspaceNavContainerStyles(sectionsEnabled)}>
      <NavigationList key={0}>
        <NavigationItem
          exact
          key={0}
          href={activeWorkspaceRoute.$}
          icon={<Folder />}
        >
          <span css={itemTextStyles}>All Notebooks</span>
        </NavigationItem>

        <NavigationItem
          key={1}
          icon={<FolderCross />}
          href={activeWorkspaceRoute.privateNotebooks({}).$}
        >
          <span css={itemTextStyles}>Private</span>
        </NavigationItem>
        <NavigationItem
          key={2}
          icon={<Globe />}
          href={activeWorkspaceRoute.published({}).$}
        >
          <span css={itemTextStyles}>Published</span>
        </NavigationItem>
        <NavigationItem
          key={3}
          icon={<Archive />}
          href={activeWorkspaceRoute.archived({}).$}
        >
          <span css={itemTextStyles}>Archived</span>
        </NavigationItem>
      </NavigationList>
      <div key="div-0" role="presentation" css={hrStyles}>
        <Divider />
      </div>

      {sectionsEnabled
        ? [
            <div
              role="presentation"
              css={css(p13Medium, {
                padding: '12px 0',
                color: cssVar('weakerTextColor'),
              })}
            >
              Sections
            </div>,
            <NavigationList key={1}>
              {swatchNames.map((color, i) => (
                <NavigationItem
                  key={i}
                  href={
                    activeWorkspaceRoute.section({
                      sectionId: color.toString(),
                    }).$
                  }
                  icon={
                    <Dot color={baseSwatches[color]} size={15} variant={true} />
                  }
                  backgroundColor={baseSwatches[color]}
                  ellipsisClick={noop}
                >
                  <span css={itemTextStyles}>{color}</span>
                </NavigationItem>
              ))}
            </NavigationList>,
          ]
        : null}
      <div></div>
      <NavigationList key={2}>
        <NavigationItem href={docs({}).$} key={0} icon={<Docs />}>
          <span css={itemTextStyles}>Documentation</span>
        </NavigationItem>
        <NavigationItem
          href="https://feedback.decipad.com"
          key={1}
          icon={<Chat />}
        >
          <span css={itemTextStyles}>Feedback</span>
        </NavigationItem>
      </NavigationList>
      <div key="div-1" role="presentation" css={hrStyles}>
        <Divider />
      </div>
      <NavigationList key={3}>
        <NavigationItem
          key={0}
          href={activeWorkspaceRoute.edit({}).$}
          icon={<Settings />}
        >
          <span css={itemTextStyles}>Workspace settings</span>
        </NavigationItem>
      </NavigationList>
    </nav>
  );
};
