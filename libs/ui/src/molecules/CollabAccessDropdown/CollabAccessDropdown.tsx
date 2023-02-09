import { css } from '@emotion/react';
import { FC } from 'react';
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
  isActivatedAccount: boolean;
  currentPermission: PermissionType;
  onRemove: () => void;
};

export const CollabAccessDropdown: FC<CollabAccessDropdownProps> = ({
  isActivatedAccount,
  currentPermission,
  onRemove,
}) => {
  const permissionLabel = !isActivatedAccount
    ? 'invited'
    : currentPermission.toLowerCase();

  return (
    <MenuList
      root
      dropdown
      align="end"
      sideOffset={4}
      trigger={
        <div css={css(p12Medium)}>
          <TextAndIconButton text={permissionLabel} onClick={noop}>
            <Caret variant="down" />
          </TextAndIconButton>
        </div>
      }
    >
      <MenuItem onSelect={noop} selected={true}>
        <p css={p14Medium}>Notebook collaborator</p>
        <p css={{ marginTop: '6px' }}>Can edit only this notebook</p>
      </MenuItem>
      <MenuItem onSelect={noop} disabled={true}>
        <div css={{ maxWidth: '200px', opacity: 0.5 }}>
          <p css={p14Medium}>
            Workspace member <SoonLabel />
          </p>
          <p css={{ marginTop: '6px' }}>
            Can edit and publish all notebooks in this workspace
          </p>
        </div>
      </MenuItem>

      <MenuItem onSelect={onRemove}>
        <p css={{ ...p14Medium, color: red500.rgb }}>Remove</p>
      </MenuItem>
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
