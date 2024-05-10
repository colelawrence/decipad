/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useCallback } from 'react';
import { MenuList } from '../../../shared/molecules';
import { MenuItem, TextAndIconButton, Tooltip } from '../../../shared/atoms';
import {
  componentCssVars,
  cssVar,
  p12Medium,
  p12Regular,
  p13Medium,
  p14Medium,
  red500,
} from '../../../primitives';
import { PermissionType } from '../../../types';
import { CaretDown, WarningCircle } from 'libs/ui/src/icons';

type CollabAccessDropdownProps = {
  isActivatedAccount?: boolean;
  isInvitationPicker?: boolean;

  currentPermission: PermissionType;
  disable?: boolean;
  onRemove?: () => void;
  onChange?: (newPermission: PermissionType) => void;
  canInviteEditors?: boolean;
  canInviteReaders?: boolean;
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
        {caret && <CaretDown />}
      </TextAndIconButton>
    </div>
  );

  const tooltipContentEditor = (
    <>
      <p css={[p12Medium, { color: componentCssVars('TooltipText') }]}>
        <strong>Unlock invite editors</strong>
      </p>
      <p
        css={[
          p12Regular,
          {
            color: componentCssVars('TooltipTextSecondary'),
            textAlign: 'center',
          },
        ]}
      >
        Upgrade your plan to invite more editors.
      </p>
    </>
  );

  const tooltipContentReader = (
    <>
      <p css={[p12Medium, { color: componentCssVars('TooltipText') }]}>
        <strong>Unlock invite readers</strong>
      </p>
      <p
        css={[
          p12Regular,
          {
            color: componentCssVars('TooltipTextSecondary'),
            textAlign: 'center',
          },
        ]}
      >
        Upgrade your plan to invite more readers.
      </p>
    </>
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
        onSelect={onCollaboratorSelected}
        selected={currentPermission === 'WRITE'}
        testid="notebook-editor"
        disabled={!canInviteEditors}
      >
        <p css={p13Medium}>Notebook editor</p>
        <div css={warningWrapperStyles}>
          <p css={dropDownItemStyles}>Can edit only this notebook</p>
          {!canInviteEditors && (
            <Tooltip
              side="top"
              trigger={
                <div>
                  <WarningCircle />
                </div>
              }
            >
              {tooltipContentEditor}
            </Tooltip>
          )}
        </div>
      </MenuItem>
      <MenuItem
        onSelect={onReaderSelected}
        selected={currentPermission === 'READ'}
        disabled={!canInviteReaders}
        testid="notebook-reader"
      >
        <p css={p13Medium}>Notebook reader</p>
        <div css={warningWrapperStyles}>
          <p css={dropDownItemStyles}>
            Can read and interact only with this notebook
          </p>
          {!canInviteReaders && (
            <Tooltip
              side="top"
              trigger={
                <div>
                  <WarningCircle />
                </div>
              }
            >
              {tooltipContentReader}
            </Tooltip>
          )}
        </div>
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
  justifyContent: 'space-between',
  '& > div': {
    width: '16px',
  },
});
