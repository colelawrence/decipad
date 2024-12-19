import { ifVaries } from '../proxy/utils';
import { ProxyFieldProps } from './types';
import { InputFieldDate } from '@decipad/ui';

export interface ProxyDateFieldProps extends ProxyFieldProps<string> {
  disabled?: boolean;
}

export const ProxyDateField = ({
  editor,
  label,
  property,
  onChange,
  disabled,
}: ProxyDateFieldProps) => {
  return (
    <InputFieldDate
      label={label}
      value={property === 'varies' ? 'Multiple' : ifVaries(property, '')}
      onChange={(newDate) => onChange(editor, newDate)}
      disabled={disabled}
    />
  );
};
