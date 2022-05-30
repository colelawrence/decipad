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
  readonly otherWorkspaces: ReadonlyArray<ComponentProps<typeof WorkspaceItem>>;
  readonly onCreateWorkspace?: () => void;
}

export const WorkspaceMenu = ({
  Heading,
  activeWorkspace,
  otherWorkspaces,
  onCreateWorkspace = noop,
}: WorkspaceMenuProps): ReturnType<FC> => {
  return (
    <nav css={styles}>
      <div css={headerStyles}>
        <Heading css={css(p13Regular)}>Workspaces</Heading>
        <IconButton roundedSquare onClick={onCreateWorkspace}>
          <Create />
        </IconButton>
      </div>
      <WorkspaceItem {...activeWorkspace} />
      {otherWorkspaces.length ? (
        <>
          <Divider />
          <NavigationList>
            {otherWorkspaces.map((workspace) => (
              <WorkspaceItem key={workspace.id} {...workspace} />
            ))}
          </NavigationList>
        </>
      ) : null}
    </nav>
  );
};
