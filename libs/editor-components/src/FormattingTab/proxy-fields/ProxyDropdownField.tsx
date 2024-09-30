import { MenuItem, DropdownField } from '@decipad/ui';
import { ProxyFieldProps } from './types';
import { ReactNode } from 'react';

export const ProxyDropdownField = <T extends string>({
  editor,
  label,
  property,
  onChange,
  options,
  labelForValue = (value) => value,
  iconForValue = () => null,
  variesIcon,
  squareIcon,
}: ProxyFieldProps<T> & {
  options: T[];
  labelForValue?: (value: T) => string;
  iconForValue?: (value: T) => ReactNode;
  variesIcon?: ReactNode;
  squareIcon?: boolean;
}) => {
  const varies = property === 'varies';

  const icon = varies ? variesIcon : iconForValue(property.value);
  const triggerText = varies ? 'Multiple' : labelForValue(property.value);

  return (
    <DropdownField
      label={label}
      icon={icon}
      squareIcon={squareIcon}
      triggerText={triggerText}
    >
      {options.map((option) => (
        <MenuItem
          key={option}
          icon={iconForValue(option)}
          squareIcon={squareIcon}
          css={{ columnGap: '6px' }}
          onSelect={() => onChange(editor, option)}
          selected={varies ? false : option === property.value}
        >
          {labelForValue(option)}
        </MenuItem>
      ))}
    </DropdownField>
  );
};
