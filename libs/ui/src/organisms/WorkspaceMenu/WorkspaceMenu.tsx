import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';

import { noop } from '@decipad/utils';
import { Section } from '../WorkspaceNavigation/WorkspaceNavigation';
import { NavigationList, WorkspaceItem } from '../../molecules';
import { cssVar, p14Medium } from '../../primitives';
import { card } from '../../styles';
import { WorkspaceItemCreate } from '../../molecules/WorkspaceItemCreate/WorkspaceItemCreate';

const styles = css(card.styles, {
  padding: '16px',

  display: 'grid',
  rowGap: '8px',

  border: 0,
});

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
  readonly onClose?: () => void;
}

export const WorkspaceMenu = ({
  Heading,
  activeWorkspace,
  allWorkspaces,
  onCreateWorkspace = noop,
  onClose = noop,
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
            onClose={onClose}
            {...workspace}
            isActive={workspace.id === activeWorkspace.id}
          />
        ))}

        <WorkspaceItemCreate key="create-new" onClick={onCreateWorkspace} />
      </NavigationList>
    </nav>
  );
};
