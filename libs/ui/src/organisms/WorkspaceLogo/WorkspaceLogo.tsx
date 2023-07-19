import { useActiveElement, useLocalStorage } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useCallback, useState } from 'react';
import { WorkspaceMenu } from '..';
import { Avatar } from '../../atoms';
import { Caret } from '../../icons';
import { cssVar, mediumShadow, p18Regular } from '../../primitives';

type WorkspaceLogoProps = ComponentProps<typeof WorkspaceMenu>;
const SELECTED_WORKSPACE_KEY = 'selectedWorkspace';

export const WorkspaceLogo = (props: WorkspaceLogoProps): ReturnType<FC> => {
  const [menuIsVisible, setMenuIsVisible] = useState(false);
  const [, setSelectedWorkspace] = useLocalStorage(SELECTED_WORKSPACE_KEY, '');

  const hideMenu = useCallback(
    () => setMenuIsVisible(false),
    [setMenuIsVisible]
  );

  const toggleMenu = useCallback(
    () => setMenuIsVisible((prev) => !prev),
    [setMenuIsVisible]
  );

  const { onCreateWorkspace } = props;
  const menuRef = useActiveElement(hideMenu);

  const createWorkspaceAndHideMenu = useCallback(() => {
    hideMenu();
    onCreateWorkspace?.();
  }, [onCreateWorkspace, hideMenu]);

  const saveWorkspaceAndHideMenu = useCallback(
    (id: string) => {
      hideMenu();
      setSelectedWorkspace(id);
    },
    [hideMenu, setSelectedWorkspace]
  );

  return (
    <div ref={menuRef}>
      {menuIsVisible && (
        <div css={workspaceSelectorStyles}>
          <WorkspaceMenu
            Heading="h1"
            allWorkspaces={props.allWorkspaces}
            onCreateWorkspace={createWorkspaceAndHideMenu}
            onWorkspaceNavigate={saveWorkspaceAndHideMenu}
            activeWorkspace={props.activeWorkspace}
          />
        </div>
      )}
      <div
        css={containerStyles}
        onClick={toggleMenu}
        data-testid="workspace-selector-button"
      >
        <div css={nameStyles}>
          <span css={avatarStyles}>
            <Avatar
              useSecondLetter={false}
              name={props.activeWorkspace.name}
              email={props.activeWorkspace.name}
            />
          </span>
          <span css={nameTextStyles}>
            <strong>{props.activeWorkspace.name}</strong>
          </span>
        </div>
        <span css={arrowDownButtonStyles}>
          <Caret variant="down" />
        </span>
      </div>
    </div>
  );
};

const workspaceSelectorStyles = css({
  position: 'absolute',
  minWidth: '256px',
  width: 'max-content',
  maxWidth: '50vw',
  top: '60px',
  left: '8px',
  zIndex: 2,

  boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
  borderRadius: '16px',
  overflow: 'hidden',
});

const containerStyles = css({
  position: 'relative',
  display: 'flex',
  padding: '8px',
  cursor: 'pointer',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  justifyContent: 'space-between',
});

const nameStyles = css({
  maxWidth: '276px',
  display: 'flex',
  gap: 12,
});

const nameTextStyles = css(p18Regular, {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const arrowDownButtonStyles = css({
  backgroundColor: cssVar('borderHighlightColor'),
  borderRadius: '50%',
  height: '24px',
  width: '24px',
  padding: '2px',
  flexShrink: 0,
});

const avatarStyles = css({
  height: 24,
  width: 24,
});
