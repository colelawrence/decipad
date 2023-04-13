import { css } from '@emotion/react';
import { FC, useCallback } from 'react';
import { noop } from 'lodash';
import { TextAndIconButton, MenuItem } from '../../atoms';
import { p12Medium, p14Medium, red500 } from '../../primitives';
import { Caret } from '../../icons/Caret/Caret';
import { MenuList } from '..';
import { PermissionType } from '../../types';

type CollabAccessDropdownProps = {
  isActivatedAccount?: boolean;
  isInvitationPicker?: boolean;

  currentPermission: PermissionType;
  onRemove?: () => void;
  onChange?: (newPermission: PermissionType) => void;
};

const dropDownItemStyles = css({
  marginTop: '6px',
  maxWidth: '200px',
});

const HumanReadablePermission: Record<PermissionType, string> = {
  READ: 'reader',
  WRITE: 'member',
  ADMIN: 'admin',
};

export const CollabMembershipDropdown: FC<CollabAccessDropdownProps> = ({
  isInvitationPicker,
  currentPermission,
  onRemove,
  onChange,
}) => {
  const permissionLabel = HumanReadablePermission[currentPermission];
  const onAdminSelected = useCallback(() => {
    onChange?.('ADMIN');
  }, [onChange]);

  const onCollaboratorSelected = useCallback(() => {
    onChange?.('WRITE');
  }, [onChange]);

  return (
    <MenuList
      root
      dropdown
      align="end"
      sideOffset={4}
      trigger={
        <div css={css(p12Medium)}>
          <TextAndIconButton
            text={permissionLabel}
            onClick={noop}
            color={isInvitationPicker ? 'transparent' : 'default'}
          >
            <Caret variant="down" />
          </TextAndIconButton>
        </div>
      }
    >
      <MenuItem
        onSelect={onAdminSelected}
        selected={currentPermission === 'ADMIN'}
      >
        <p css={p14Medium}>Workspace admin</p>
        <p css={dropDownItemStyles}>
          Can edit any notebook in this workspace and manage workspace members
        </p>
      </MenuItem>
      <MenuItem
        onSelect={onCollaboratorSelected}
        selected={currentPermission === 'WRITE'}
      >
        <p css={p14Medium}>Workspace member</p>
        <p css={dropDownItemStyles}>Can edit any notebook in this workspace</p>
      </MenuItem>

      {onRemove && (
        <MenuItem onSelect={onRemove}>
          <p css={{ ...p14Medium, color: red500.rgb }}>Remove</p>
        </MenuItem>
      )}
    </MenuList>
  );
};
