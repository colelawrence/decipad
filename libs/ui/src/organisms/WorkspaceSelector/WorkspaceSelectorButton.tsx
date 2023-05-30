/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useCallback } from 'react';
import { Avatar } from '../../atoms';
import { WorkspaceItem } from '../../molecules';
import { purple300, smallScreenQuery } from '../../primitives';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

interface WorkspaceSelectorButtonProps {
  readonly activeWorkspace: ComponentProps<typeof WorkspaceItem>;
  readonly thisWorkspace: ComponentProps<typeof WorkspaceItem>;
  readonly onClickWorkspace?: (id: string) => void;
}

export const WorkspaceButtonSelector = ({
  activeWorkspace,
  thisWorkspace,
  onClickWorkspace = noop,
}: WorkspaceSelectorButtonProps): ReturnType<FC> => {
  return (
    <div css={workspaceButtonWrapperStyles}>
      <button
        onClick={useEventNoEffect(
          useCallback(() => {
            // Doing navigation programatically instead of using an <Anchor> component because <a>
            // inside of an <a> is semantically forbidden.
            onClickWorkspace(thisWorkspace.id);
          }, [thisWorkspace.id, onClickWorkspace])
        )}
      >
        <Avatar
          name={thisWorkspace.name}
          title={`Workspace "${thisWorkspace.name}"`}
          variant
          roundedSquare
        />
      </button>
      <span
        css={
          thisWorkspace.id === activeWorkspace.id && workspaceIsSelectedStyles
        }
      />
    </div>
  );
};

const workspaceIsSelectedStyles = css({
  position: 'absolute',
  left: '0px',
  width: '4px',
  height: '24px',
  borderTopRightRadius: '4px',
  borderBottomRightRadius: '4px',
  backgroundColor: purple300.rgb,
  [smallScreenQuery]: {
    left: 'unset',
    borderTopRightRadius: 0,
    borderBottomLeftRadius: '4px',
    top: 0,
    height: '4px',
    width: '24px',
  },
});

const workspaceButtonWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '16px',
  minHeight: '16px',
  maxWidth: '32px',
  maxHeight: '32px',
});
