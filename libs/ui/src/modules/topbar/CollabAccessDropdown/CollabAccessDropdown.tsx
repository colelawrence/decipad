/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useCallback } from 'react';
import { MenuList } from '../../../shared/molecules';
import { MenuItem, TextAndIconButton } from '../../../shared/atoms';
import { Caret } from '../../../icons/Caret/Caret';
import {
  cssVar,
  p12Medium,
  p12Regular,
  p13Medium,
  p14Medium,
  red500,
} from '../../../primitives';
import { PermissionType } from '../../../types';

type CollabAccessDropdownProps = {
  isActivatedAccount?: boolean;
  isInvitationPicker?: boolean;

  currentPermission: PermissionType;
  disable?: boolean;
  onRemove?: () => void;
  onChange?: (newPermission: PermissionType) => void;
};

const HumanReadablePermission: Record<PermissionType, string> = {
  READ: 'reader',
  WRITE: 'collaborator',
  ADMIN: 'author',
};

export const CollabAccessDropdown: FC<CollabAccessDropdownProps> = ({
  isInvitationPicker,
  currentPermission,
  onRemove,
  onChange,
  disable,
}) => {
  const permissionLabel = HumanReadablePermission[currentPermission];

  const onReaderSelected = useCallback(() => {
    onChange?.('READ');
  }, [onChange]);

  const onCollaboratorSelected = useCallback(() => {
    onChange?.('WRITE');
  }, [onChange]);

  if (disable) {
    return <div css={css(p12Medium)}>{permissionLabel}</div>;
  }

  const triggerElement = (caret = true) => (
    <div
      css={css(p12Medium, !caret && { button: { cursor: 'default' } })}
      data-testId="collaboration-level-dropdown"
    >
      <TextAndIconButton
        text={permissionLabel}
        onClick={noop}
        color={isInvitationPicker ? 'transparent' : 'default'}
      >
        {caret && <Caret variant="down" />}
      </TextAndIconButton>
    </div>
  );

  return currentPermission === 'ADMIN' ? (
    triggerElement(false)
  ) : (
    <MenuList
      portal
      root
      dropdown
      align="end"
      sideOffset={4}
      trigger={triggerElement(true)}
    >
      <MenuItem
        onSelect={onReaderSelected}
        selected={currentPermission === 'READ'}
        testid="notebook-reader"
      >
        <p css={p13Medium}>Notebook reader</p>
        <p css={dropDownItemStyles}>
          Can read and interact only with this notebook
        </p>
      </MenuItem>
      <MenuItem
        onSelect={onCollaboratorSelected}
        selected={currentPermission === 'WRITE'}
        testid="notebook-editor"
      >
        <p css={p13Medium}>Notebook editor</p>
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

const dropDownItemStyles = css(p12Regular, {
  color: cssVar('textSubdued'),
  marginTop: '6px',
  maxWidth: '224px',
});

const dangerOptionStyles = css(p14Medium, {
  color: red500.rgb,
});
