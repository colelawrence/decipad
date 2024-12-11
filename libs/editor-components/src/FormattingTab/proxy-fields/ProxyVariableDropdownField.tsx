import { useCallback, useId, useMemo, useState } from 'react';
import { ProxyFieldProps } from './types';
import { useResults } from '../../hooks';
import {
  DropdownMenu,
  SelectItems,
  DropdownFieldLabel,
  DropdownFieldTrigger,
} from '@decipad/ui';
import { SerializedType } from '@decipad/language-interfaces';

export const ProxyVariableDropdownField = ({
  editor,
  label,
  property,
  onChange,
  placeholder,
  filterType,
}: ProxyFieldProps<string> & {
  placeholder: string;
  filterType: (serializedType: SerializedType) => boolean;
}) => {
  const id = `dropdown-${useId()}`;
  const [open, setOpen] = useState(false);
  const allResults = useResults({ enabled: true });

  const hasBlockId = property !== 'varies' && property.value !== '';

  const filteredResults = useMemo(
    () =>
      allResults.filter(({ blockType }) => blockType && filterType(blockType)),
    [allResults, filterType]
  );

  const result = useMemo(() => {
    if (property === 'varies') return null;
    return allResults.find((r) => r.blockId === property.value) ?? null;
  }, [allResults, property]);

  const triggerText = useMemo(() => {
    if (property === 'varies') return 'Multiple';
    if (!hasBlockId) return placeholder;
    if (!result) return 'Missing variable';
    return result.item;
  }, [property, result, hasBlockId, placeholder]);

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
        items={filteredResults}
        selectedId={result?.id}
        renderEmpty="No variables"
        isCombobox
      >
        <DropdownFieldTrigger id={id} icon={result?.icon}>
          {triggerText}
        </DropdownFieldTrigger>
      </DropdownMenu>
    </div>
  );
};
