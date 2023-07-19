import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';

import { noop } from '@decipad/utils';
import { NavigationList, WorkspaceItem } from '../../molecules';
import { WorkspaceItemCreate } from '../../molecules/WorkspaceItemCreate/WorkspaceItemCreate';
import { cssVar, p14Medium } from '../../primitives';
import { card } from '../../styles';
import { deciOverflowYStyles } from '../../styles/scrollbars';
import { Section } from '../WorkspaceNavigation/WorkspaceNavigation';

const styles = css(
  card.styles,
  {
    maxHeight: '50vh',
    padding: '16px',

    display: 'grid',
    rowGap: '8px',

    border: 0,
  },
  deciOverflowYStyles
);

const headerStyles = css({
  paddingTop: '4px',
  display: 'grid',
  gridTemplateColumns: 'auto 16px',
  alignItems: 'center',
});

const headingStyles = css(p14Medium, {
  color: cssVar('weakerTextColor'),
  marginLeft: '8px',
});

interface WorkspaceMenuProps {
  readonly Heading: 'h1';

  readonly activeWorkspace: ComponentProps<typeof WorkspaceItem> & {
    sections: Section[];
  };
  readonly allWorkspaces: ReadonlyArray<ComponentProps<typeof WorkspaceItem>>;
  readonly onCreateWorkspace?: () => void;
  readonly onClickWorkspace?: (id: string) => void;
  readonly onWorkspaceNavigate?: (id: string) => void;
}

export const WorkspaceMenu = ({
  Heading,
  activeWorkspace,
  allWorkspaces,
  onCreateWorkspace = noop,
  onWorkspaceNavigate = noop,
}: WorkspaceMenuProps): ReturnType<FC> => {
  return (
    <nav css={styles}>
      <div css={headerStyles}>
        <Heading css={headingStyles}>Workspaces</Heading>
      </div>
      <NavigationList>
        {allWorkspaces.map((workspace) => (
          <WorkspaceItem
            key={workspace.id}
            onWorkspaceNavigate={onWorkspaceNavigate}
            {...workspace}
            isActive={workspace.id === activeWorkspace.id}
          />
        ))}

        <WorkspaceItemCreate key="create-new" onClick={onCreateWorkspace} />
      </NavigationList>
    </nav>
  );
};
