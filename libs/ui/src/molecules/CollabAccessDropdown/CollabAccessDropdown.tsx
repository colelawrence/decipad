import { css } from '@emotion/react';
import { FC, useCallback } from 'react';
import { noop } from 'lodash';
import { TextAndIconButton, MenuItem } from '../../atoms';
import {
  p12Medium,
  p14Medium,
  red500,
  cssVar,
  p8Medium,
} from '../../primitives';
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

const dropdownDisabledItemStyles = css(dropDownItemStyles, {
  opacity: 0.5,
});

const HumanReadablePermission: Record<PermissionType, string> = {
  READ: 'reader',
  WRITE: 'collaborator',
  ADMIN: 'owner',
};

export const CollabAccessDropdown: FC<CollabAccessDropdownProps> = ({
  isActivatedAccount,
  isInvitationPicker,
  currentPermission,
  onRemove,
  onChange,
}) => {
  const permissionLabel =
    !isActivatedAccount && !isInvitationPicker
      ? 'invited'
      : HumanReadablePermission[currentPermission];

  const onReaderSelected = useCallback(() => {
    onChange?.('READ');
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
        onSelect={onReaderSelected}
        selected={currentPermission === 'READ'}
      >
        <p css={p14Medium}>Notebook reader</p>
        <p css={dropDownItemStyles}>
          Can read and interact only with this notebook
        </p>
      </MenuItem>
      <MenuItem
        onSelect={onCollaboratorSelected}
        selected={currentPermission === 'WRITE'}
      >
        <p css={p14Medium}>Notebook collaborator</p>
        <p css={dropDownItemStyles}>Can edit only this notebook</p>
      </MenuItem>
      <MenuItem onSelect={noop} disabled={true}>
        <div css={dropdownDisabledItemStyles}>
          <p css={p14Medium}>
            Workspace member <SoonLabel />
          </p>
          <p css={dropDownItemStyles}>
            Can edit and publish all notebooks in this workspace
          </p>
        </div>
      </MenuItem>

      {onRemove && (
        <MenuItem onSelect={onRemove}>
          <p css={{ ...p14Medium, color: red500.rgb }}>Remove</p>
        </MenuItem>
      )}
    </MenuList>
  );
};

const SoonLabel: React.FC = () => (
  <span
    css={{
      ...p8Medium,
      padding: '2px 4px',
      borderRadius: '4px',
      backgroundColor: cssVar('buttonHoverBackground'),
      textTransform: 'uppercase',
    }}
  >
    soon
  </span>
);
