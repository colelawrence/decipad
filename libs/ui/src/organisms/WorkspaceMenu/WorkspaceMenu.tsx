import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';

import { noop } from '@decipad/utils';
import { Divider, IconButton } from '../../atoms';
import { Create } from '../../icons';
import { NavigationList, WorkspaceItem } from '../../molecules';
import { p13Regular } from '../../primitives';
import { card } from '../../styles';

const styles = css({
  ...card.styles,

  padding: '16px',

  display: 'grid',
  rowGap: '8px',
});

const headerStyles = css({
  paddingTop: '4px',
  paddingBottom: '2px',

  display: 'grid',
  gridTemplateColumns: 'auto 16px',
  alignItems: 'center',
});

interface WorkspaceMenuProps {
  readonly Heading: 'h1';

  readonly activeWorkspace: ComponentProps<typeof WorkspaceItem>;
  readonly allWorkspaces: ReadonlyArray<ComponentProps<typeof WorkspaceItem>>;
  readonly onCreateWorkspace?: () => void;
  readonly onEditWorkspace?: ComponentProps<
    typeof WorkspaceItem
  >['onClickEdit'];
  readonly onClickWorkspace?: (id: string) => void;
}

export const WorkspaceMenu = ({
  Heading,
  activeWorkspace,
  allWorkspaces,
  onCreateWorkspace = noop,
  onEditWorkspace = noop,
}: WorkspaceMenuProps): ReturnType<FC> => {
  return (
    <nav css={styles}>
      <div css={headerStyles}>
        <Heading css={css(p13Regular)}>Workspaces</Heading>
        <IconButton roundedSquare onClick={onCreateWorkspace}>
          <Create />
        </IconButton>
      </div>
      <WorkspaceItem {...activeWorkspace} onClickEdit={onEditWorkspace} />
      {allWorkspaces.length ? (
        <>
          <Divider />
          <NavigationList>
            {allWorkspaces.map((workspace) => (
              <WorkspaceItem
                key={workspace.id}
                onClickEdit={onEditWorkspace}
                {...workspace}
              />
            ))}
          </NavigationList>
        </>
      ) : null}
    </nav>
  );
};
