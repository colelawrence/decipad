import { FC } from 'react';

import { noop } from '@decipad/utils';
import { WorkspaceItem } from '../WorkspaceItem/WorkspaceItem';

import * as Styled from './styles';

import { Button } from 'libs/ui/src/shared';
import { WorkspaceMeta } from 'libs/ui/src/types';
import { isFlagEnabled } from '@decipad/feature-flags';

interface WorkspaceMenuProps {
  readonly workspaces: WorkspaceMeta[];
  readonly hasFreeWorkspaceSlot: boolean;
  readonly onCreateWorkspace: () => void;
  readonly onSelectWorkspace: (id: string) => void;
}

export const WorkspaceMenu = ({
  workspaces,
  hasFreeWorkspaceSlot,
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
        {isFlagEnabled('NEW_PAYMENTS')
          ? hasFreeWorkspaceSlot || isFlagEnabled('ALLOW_CREATE_NEW_WORKSPACE')
            ? 'Create a new workspace'
            : 'Create an upgraded workspace'
          : 'Create a new workspace'}
      </Button>
    </Styled.MenuWrapper>
  );
};
