import { FC, ReactNode } from 'react';
import { noop } from '@decipad/utils';
import { MenuList } from '../../molecules';
import { MenuItem, TriggerMenuItem } from '../../atoms';

export interface JsonPath {
  label: string;
  fullPathFromRoot: string;
  children: JsonPath[];
}

export interface JsonPathMenuItemProps {
  onChangeOpen?: (open: boolean) => void;
  open?: boolean;
  selectedJsonPath: string;
  jsonPaths: JsonPath[];
  onSelect?: (selected: string) => void;
  itemTrigger: ReactNode;
}

export const JsonPathMenuItem: FC<JsonPathMenuItemProps> = ({
  onChangeOpen,
  open,
  selectedJsonPath,
  jsonPaths,
  onSelect = noop,
  itemTrigger,
}) => {
  return (
    <MenuList itemTrigger={itemTrigger} onChangeOpen={onChangeOpen} open={open}>
      {jsonPaths.map((jsonPath, index) => (
        <MenuItem
          key={index}
          selected={selectedJsonPath === jsonPath.fullPathFromRoot}
          onSelect={() => onSelect(jsonPath.fullPathFromRoot)}
        >
          {jsonPath.children.length ? (
            <JsonPathMenuItem
              selectedJsonPath={selectedJsonPath}
              jsonPaths={jsonPath.children}
              onSelect={onSelect}
              itemTrigger={<TriggerMenuItem>{jsonPath.label}</TriggerMenuItem>}
            />
          ) : (
            <span>{jsonPath.label}</span>
          )}
        </MenuItem>
      ))}
    </MenuList>
  );
};
