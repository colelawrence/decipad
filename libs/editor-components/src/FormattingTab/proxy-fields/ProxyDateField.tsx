import { ifVaries } from '../proxy/utils';
import { ProxyFieldProps } from './types';
import { InputFieldDate } from '@decipad/ui';

export const ProxyDateField = ({
  editor,
  label,
  property,
  onChange,
}: ProxyFieldProps<string>) => {
  return (
    <InputFieldDate
      size="small"
      label={label}
      value={ifVaries(property, '')}
      onChange={(newDate) => onChange(editor, newDate)}
    />
  );
};
