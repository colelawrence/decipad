import { NotebookMetaDataFragment } from '@decipad/graphql-client';
import { FC, ReactNode, useMemo, useState } from 'react';
import { MenuList } from '../../../shared/molecules';
import {
  AvailableColorStatus,
  ColorStatusNames,
  TColorStatus,
} from '../../../utils';
import {
  ColorStatusCircle,
  MenuItem,
  TriggerMenuItem,
} from '../../../shared/atoms';
import { p12Regular } from '../../../primitives';
import styled from '@emotion/styled';
import {
  DropdownRootMenuListProps,
  MenuItemMenuListProps,
} from '../../../shared/molecules/MenuList/MenuList';
import { CheckboxSelected } from '../../../icons';

export interface NotebookStatusDropdownProps {
  readonly status: TColorStatus;
  readonly trigger?: ReactNode;

  readonly onChangeStatus: (status: TColorStatus) => void;
  readonly permissionType: NotebookMetaDataFragment['myPermissionType'];
}

/**
 * UI for the menu that changes notebook status.
 * Can be used as its own component or nested in another list.
 */
export const NotebookStatusDropdown: FC<NotebookStatusDropdownProps> = ({
  status,
  trigger,
  onChangeStatus,
  permissionType,
}) => {
  const [statusOpen, setStatusOpen] = useState(false);

  const menuListOptions = useMemo(
    () =>
      trigger
        ? ({
            root: true,
            trigger,

            dropdown: true,
          } satisfies DropdownRootMenuListProps)
        : ({
            itemTrigger: (
              <TriggerMenuItem icon={<CheckboxSelected />}>
                Change Status
              </TriggerMenuItem>
            ),
          } satisfies MenuItemMenuListProps),
    [trigger]
  );

  return (
    <MenuList
      {...menuListOptions}
      align="end"
      side="bottom"
      sideOffset={10}
      open={statusOpen}
      onChangeOpen={setStatusOpen}
    >
      {permissionType === 'READ' && (
        <ReaderInfo>
          As a Reader, you can not change Notebook status.
        </ReaderInfo>
      )}
      {permissionType !== 'READ' &&
        AvailableColorStatus.map((label) => (
          <MenuItem
            key={label}
            icon={<ColorStatusCircle name={label} />}
            onSelect={() => {
              onChangeStatus(label as TColorStatus);
              setStatusOpen(!statusOpen);
            }}
            selected={status === label}
          >
            <span>{ColorStatusNames[label]}</span>
          </MenuItem>
        ))}
    </MenuList>
  );
};

const ReaderInfo = styled.li(p12Regular, {
  padding: '4px 8px',
  width: '152px',
  listStyle: 'none',
});
