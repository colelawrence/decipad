import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';

import { Divider, IconButton } from '../../atoms';
import { Create } from '../../icons';
import { NavigationList, WorkspaceItem } from '../../molecules';
import { cssVar, p13Regular } from '../../primitives';
import { noop } from '../../utils';

const styles = css({
  border: `1px solid ${cssVar('highlightColor')}`,
  borderRadius: '8px',

  padding: '12px',

  display: 'grid',
  rowGap: '8px',
});

const headerStyles = css({
  padding: '4px 2px 2px',

  display: 'grid',
  gridTemplateColumns: 'auto 16px',
  alignItems: 'center',
});

interface WorkspaceMenuProps {
  readonly Heading: 'h1';

  readonly activeWorkspace: ComponentProps<typeof WorkspaceItem>;
  readonly otherWorkspaces: ReadonlyArray<
    ComponentProps<typeof WorkspaceItem> & { readonly id: string }
  >;
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
        <IconButton onClick={onCreateWorkspace}>
          <Create />
        </IconButton>
      </div>
      <WorkspaceItem {...activeWorkspace} />
      {otherWorkspaces.length ? (
        <>
          <Divider />
          <NavigationList>
            {otherWorkspaces.map(({ id, ...workspace }) => (
              <WorkspaceItem key={id} {...workspace} />
            ))}
          </NavigationList>
        </>
      ) : null}
    </nav>
  );
};
