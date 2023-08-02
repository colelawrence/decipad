/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useCallback } from 'react';
import { MenuList } from '..';
import { MenuItem, TextAndIconButton } from '../../atoms';
import { Caret } from '../../icons/Caret/Caret';
import { p12Medium, p14Medium, red500 } from '../../primitives';
import { PermissionType } from '../../types';

type CollabAccessDropdownProps = {
  isActivatedAccount?: boolean;
  isInvitationPicker?: boolean;

  currentPermission: PermissionType;
  disable?: boolean;
  onRemove?: () => void;
  onChange?: (newPermission: PermissionType) => void;
};

const HumanReadablePermission: Record<PermissionType, string> = {
  READ: 'Reader',
  WRITE: 'Collaborator',
  ADMIN: 'Author',
};

export const CollabAccessDropdown: FC<CollabAccessDropdownProps> = ({
  isActivatedAccount,
  isInvitationPicker,
  currentPermission,
  onRemove,
  onChange,
  disable,
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

  if (disable) {
    return <div css={css(p12Medium)}>{permissionLabel}</div>;
  }

  const triggerElement = (
    <div css={css(p12Medium)}>
      <TextAndIconButton
        text={permissionLabel}
        onClick={noop}
        color={isInvitationPicker ? 'transparent' : 'default'}
      >
        <Caret variant="down" />
      </TextAndIconButton>
    </div>
  );

  return (
    <MenuList
      portal={false}
      root
      dropdown
      align="end"
      sideOffset={4}
      trigger={triggerElement}
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

      {onRemove && (
        <MenuItem onSelect={onRemove}>
          <p css={dangerOptionStyles}>Remove</p>
        </MenuItem>
      )}
    </MenuList>
  );
};

const dropDownItemStyles = css({
  marginTop: '6px',
  maxWidth: '224px',
});

const dangerOptionStyles = css(p14Medium, {
  color: red500.rgb,
});
