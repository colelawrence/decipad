import { FC } from 'react';

import { noop } from '@decipad/utils';
import { WorkspaceItem } from '../WorkspaceItem/WorkspaceItem';

import * as Styled from './styles';

import { Button } from 'libs/ui/src/shared';
import { WorkspaceMeta } from 'libs/ui/src/types';

interface WorkspaceMenuProps {
  readonly workspaces: WorkspaceMeta[];
  readonly onCreateWorkspace: () => void;
  readonly onSelectWorkspace: (id: string) => void;
}

export const WorkspaceMenu = ({
  workspaces,
  onCreateWorkspace = noop,
  onSelectWorkspace = noop,
}: WorkspaceMenuProps): ReturnType<FC> => {
  return (
    <Styled.MenuWrapper>
      <Styled.MenuNav>
        <Styled.MenuHeader>Workspaces</Styled.MenuHeader>
        {workspaces.map((workspace) => (
          <WorkspaceItem
            key={workspace.id}
            onSelect={onSelectWorkspace}
            name={workspace.name}
            id={workspace.id}
            membersCount={workspace.membersCount ?? 1}
            isPremium={!!workspace.isPremium}
            isActive={workspace.isSelected}
            plan={workspace?.plan?.title}
          />
        ))}
      </Styled.MenuNav>
      <Button
        type="tertiaryAlt"
        testId="create-workspace-button"
        onClick={onCreateWorkspace}
      >
        Create workspace
      </Button>
    </Styled.MenuWrapper>
  );
};
