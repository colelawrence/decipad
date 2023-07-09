/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { IconButton, Tooltip } from '../../atoms';
import { Create } from '../../icons';
import { WorkspaceItem } from '../../molecules';
import { smallScreenQuery } from '../../primitives';
import { WorkspaceButtonSelector } from './WorkspaceSelectorButton';

interface WorkspaceSelectorProps {
  readonly activeWorkspace: ComponentProps<typeof WorkspaceItem>;
  readonly allWorkspaces: ReadonlyArray<ComponentProps<typeof WorkspaceItem>>;
  readonly onCreateWorkspace?: () => void;
  readonly onClickWorkspace?: (id: string) => void;
}

export const WorkspaceSelector = ({
  activeWorkspace,
  allWorkspaces,
  onCreateWorkspace = noop,
  onClickWorkspace = noop,
}: WorkspaceSelectorProps): ReturnType<FC> => {
  return (
    <div css={workspaceSelectorStyles}>
      <div
        css={{
          margin: '20px 10.5px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          [smallScreenQuery]: {
            flexDirection: 'row',
            margin: '10.5px 20px',
            width: '100%',
          },
        }}
      >
        {allWorkspaces.map((thisWorkspace, i) => (
          <div key={i} css={workspaceAvatars}>
            <Tooltip
              side="right"
              variant="small"
              hoverOnly
              trigger={
                <WorkspaceButtonSelector
                  activeWorkspace={activeWorkspace}
                  thisWorkspace={thisWorkspace}
                  onClickWorkspace={onClickWorkspace}
                ></WorkspaceButtonSelector>
              }
            >
              {thisWorkspace.name}
            </Tooltip>
          </div>
        ))}
        <Tooltip
          side="right"
          variant="small"
          trigger={
            <div
              css={createWorkspaceButton}
              data-testid="create-workspace-button"
            >
              <IconButton roundedSquare onClick={onCreateWorkspace}>
                <Create />
              </IconButton>
            </div>
          }
        >
          Create a new workspace
        </Tooltip>
      </div>
    </div>
  );
};

const workspaceSelectorStyles = css({
  width: '55px',
  overflowX: 'hidden',
  display: 'inline-flex',
  flexShrink: 0,
  flexDirection: 'column',
  [smallScreenQuery]: {
    width: '100%',
    flexDirection: 'row',
    height: '55px',
  },
});

const workspaceAvatars = css({
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const createWorkspaceButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& button': {
    width: '32px',
    height: '32px',
  },
});
