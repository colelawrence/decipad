/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { FC, useCallback } from 'react';
import { MenuList } from '../../../shared/molecules';
import { MenuItem, TextAndIconButton } from '../../../shared';
import {
  cssVar,
  p12Medium,
  p12Regular,
  p13Medium,
  p14Medium,
  red500,
} from '../../../primitives';
import { PermissionType } from '../../../types';
import { CaretDown } from 'libs/ui/src/icons';
import * as Styled from './styles';

type CollabAccessDropdownProps = {
  isActivatedAccount?: boolean;
  isInvitationPicker?: boolean;

  currentPermission: PermissionType;
  disable?: boolean;
  onRemove?: () => void;
  onChange?: (newPermission: PermissionType) => void;
  canInviteEditors?: boolean;
  canInviteReaders?: boolean;
  hasPaywall?: boolean;
};

const HumanReadablePermission: Record<PermissionType, string> = {
  READ: 'reader',
  WRITE: 'editor',
  ADMIN: 'author',
};

export const CollabAccessDropdown: FC<CollabAccessDropdownProps> = ({
  isInvitationPicker,
  currentPermission,
  onRemove,
  onChange,
  disable,
  canInviteReaders,
  canInviteEditors,
  hasPaywall,
}) => {
  const permissionLabel = HumanReadablePermission[currentPermission];
  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();

  const onReaderSelected = useCallback(() => {
    if (canInviteReaders) {
      onChange?.('READ');
    } else {
      setIsUpgradeWorkspaceModalOpen(true);
    }
  }, [onChange, setIsUpgradeWorkspaceModalOpen, canInviteReaders]);

  const onCollaboratorSelected = useCallback(() => {
    if (canInviteEditors) {
      onChange?.('WRITE');
    } else {
      setIsUpgradeWorkspaceModalOpen(true);
    }
  }, [onChange, setIsUpgradeWorkspaceModalOpen, canInviteEditors]);

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
        {caret && <CaretDown />}
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
      modal={false}
      align="end"
      sideOffset={4}
      trigger={triggerElement(true)}
    >
      <MenuItem
        onSelect={onCollaboratorSelected}
        selected={currentPermission === 'WRITE'}
        testid="notebook-editor"
      >
        <div css={warningWrapperStyles}>
          <p css={p13Medium}>Notebook editor</p>
          {!canInviteEditors && !hasPaywall && (
            <Styled.Badge>Upgrade</Styled.Badge>
          )}
        </div>
        <p css={dropDownItemStyles}>Can edit only this notebook</p>
      </MenuItem>
      <MenuItem
        onSelect={onReaderSelected}
        selected={currentPermission === 'READ'}
        testid="notebook-reader"
      >
        <div css={warningWrapperStyles}>
          <p css={p13Medium}>Notebook reader</p>
          {!canInviteReaders && !hasPaywall && (
            <Styled.Badge>Upgrade</Styled.Badge>
          )}
        </div>
        <p css={dropDownItemStyles}>
          Can read and interact only with this notebook
        </p>
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

const warningWrapperStyles = css({
  display: 'flex',
  gap: '8px',
  '& > div': {
    width: '16px',
  },
});
