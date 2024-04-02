import { FC } from 'react';

import { noop } from '@decipad/utils';
import { WorkspaceItem } from '../WorkspaceItem/WorkspaceItem';
import { workspaces as routingWorkspaces } from '@decipad/routing';

import * as Styled from './styles';

import { Button } from 'libs/ui/src/shared';
import { isFlagEnabled } from '@decipad/feature-flags';
import { ShallowWorkspaceFragment } from '@decipad/graphql-client';
import { useRouteParams } from 'typesafe-routes/react-router';

interface WorkspaceMenuProps {
  readonly workspaces: ShallowWorkspaceFragment[];
  readonly hasFreeWorkspaceSlot: boolean;
  readonly onCreateWorkspace: () => void;
  readonly onSelectWorkspace: (id: string) => void;
  readonly getPlanTitle: (workspace: ShallowWorkspaceFragment) => string;
}

export const WorkspaceMenu = ({
  workspaces,
  hasFreeWorkspaceSlot,
  getPlanTitle,
  onCreateWorkspace = noop,
  onSelectWorkspace = noop,
}: WorkspaceMenuProps): ReturnType<FC> => {
  const { workspaceId } = useRouteParams(routingWorkspaces({}).workspace);

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
            isActive={workspace.id === workspaceId}
            plan={getPlanTitle(workspace)}
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
