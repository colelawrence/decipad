import { FC, useState } from 'react';
import { MenuItem, MenuList } from '../../shared';
import { CaretDown, CaretUp } from '../../icons';
import styled from '@emotion/styled';
import { cssVar, p14Regular } from '../../primitives';
import { useElementWidth } from '@decipad/react-utils';
import { noop } from '@decipad/utils';

type BasicSelector = { id: string | number; name: string };

interface UISelectConnectionProps<T extends BasicSelector> {
  name: string | undefined;
  label?: string;
  extraOption?: { callback: () => void; label: string };

  selections: Array<T>;
  onSelect: (source: T) => void;

  disabled?: boolean;
}

export const OptionsList = <T extends BasicSelector>({
  name,
  label,
  selections,

  extraOption,
  onSelect,

  disabled,
}: UISelectConnectionProps<T>): ReturnType<FC> => {
  const [open, setOpen] = useState(false);

  const [sizeRef, width] = useElementWidth<HTMLDivElement>();

  return (
    <MenuList
      root
      dropdown
      open={open}
      onChangeOpen={!disabled ? setOpen : noop}
      sideOffset={6}
      trigger={
        <Trigger ref={sizeRef}>
          <span>{name ?? label}</span>
          {open ? <CaretUp /> : <CaretDown />}
        </Trigger>
      }
    >
      {extraOption && (
        <MenuItem
          key="add-new"
          style={{ minWidth: width }}
          onSelect={extraOption.callback}
        >
          {extraOption.label}
        </MenuItem>
      )}
      {selections.map((c) => (
        <MenuItem
          style={{ minWidth: width }}
          key={c.id}
          onSelect={() => onSelect(c)}
        >
          {c.name}
        </MenuItem>
      ))}
    </MenuList>
  );
};

const Trigger = styled.div(p14Regular, {
  color: cssVar('textDisabled'),
  cursor: 'pointer',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  borderRadius: '6px',
  height: '32px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  padding: '8px 12px',
  overflow: 'hidden',
  svg: { width: '16px', height: '16px' },
});
