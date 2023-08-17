import { FC, ReactNode, useMemo, useState } from 'react';
import { MenuList } from '..';
import {
  AvailableColorStatus,
  ColorStatusNames,
  TColorStatus,
} from '../../utils';
import { ColorStatusCircle, MenuItem, TriggerMenuItem } from '../../atoms';
import {
  DropdownRootMenuListProps,
  MenuItemMenuListProps,
} from '../MenuList/MenuList';
import { CheckboxSelected } from '../../icons';

export interface NotebookStatusDropdownProps {
  readonly status: TColorStatus;
  readonly trigger?: ReactNode;

  readonly onChangeStatus: (status: TColorStatus) => void;
}

/**
 * UI for the menu that changes notebook status.
 * Can be used as its own component or nested in another list.
 */
export const NotebookStatusDropdown: FC<NotebookStatusDropdownProps> = ({
  status,
  trigger,
  onChangeStatus,
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
      {AvailableColorStatus.map((label) => (
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
