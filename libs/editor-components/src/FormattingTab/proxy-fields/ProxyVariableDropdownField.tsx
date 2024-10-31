import { useCallback, useId, useMemo, useState } from 'react';
import { ProxyFieldProps } from './types';
import { UseResultsOptions, useResults } from '../../hooks';
import {
  DropdownMenu,
  SelectItems,
  DropdownFieldLabel,
  DropdownFieldTrigger,
} from '@decipad/ui';

export const ProxyVariableDropdownField = ({
  editor,
  label,
  property,
  onChange,
  placeholder,
  filterType,
}: ProxyFieldProps<string> & {
  placeholder: string;
  filterType: UseResultsOptions['filterType'];
}) => {
  const id = `dropdown-${useId()}`;
  const [open, setOpen] = useState(false);
  const allResults = useResults({ enabled: true, filterType });

  /**
   * FIXME before merge: If the type of the selected variable changes and fails
   * filterType, UI will incorrectly report that no variable is selected.
   */
  const result = useMemo(() => {
    if (property === 'varies') return null;
    return allResults.find((r) => r.blockId === property.value) ?? null;
  }, [allResults, property]);

  const onExecute = useCallback(
    (item: SelectItems) => {
      onChange(editor, item.blockId ?? '');
      setOpen(false);
    },
    [editor, onChange]
  );

  return (
    <div>
      <DropdownFieldLabel id={id}>{label}</DropdownFieldLabel>
      <DropdownMenu
        open={open}
        setOpen={setOpen}
        onExecute={onExecute}
        groups={allResults}
        selectedIndex={result?.index}
        renderEmpty="No variables"
      >
        <DropdownFieldTrigger id={id} icon={result?.icon}>
          {property === 'varies' ? 'Multiple' : result?.item ?? placeholder}
        </DropdownFieldTrigger>
      </DropdownMenu>
    </div>
  );
};
