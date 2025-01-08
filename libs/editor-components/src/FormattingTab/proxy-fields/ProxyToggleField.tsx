import { Toggle } from '@decipad/ui';
import { ProxyFieldProps } from './types';
import { ifVaries } from '../proxy/utils';

export const ProxyToggleField = ({
  editor,
  label,
  property,
  onChange,
}: ProxyFieldProps<boolean> & { label: string }) => {
  return (
    <Toggle
      active={ifVaries(property, 'mixed')}
      onChange={(newActive) => onChange(editor, newActive)}
      label={label}
    />
  );
};
