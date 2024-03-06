import { CellValueType, TableCellElement } from '@decipad/editor-types';
import { Path } from 'slate';
import { FC, HTMLAttributes, useMemo, useRef } from 'react';
import type { CellProps } from './types';
import { cellPlugins } from './cell-plugins';
import { CellEditorDefault } from './CellEditorDefault';

export interface CellEditorProps extends HTMLAttributes<HTMLTableCellElement> {
  isTableFrozen?: boolean;
  selected?: boolean;
  focused?: boolean;
  type?: CellValueType;
  value?: string;
  renderComputedValue?: boolean;
  eventTarget?: EventTarget;
  onValueChange?: (value: string) => void;
  onConvertToFormula?: () => void;
  onSelectNextCell?: (
    edge?: 'before' | 'after' | 'top' | 'left' | 'bottom' | 'right'
  ) => void;
  path: Path;
  element: TableCellElement;
  onEditingChange?: (editing: boolean) => void;
}

export const CellEditor = ({
  isTableFrozen = false,
  type,
  value = '',
  renderComputedValue = false,
  eventTarget,
  onValueChange,
  onConvertToFormula,
  onSelectNextCell,
  path,
  element,
  onEditingChange,
}: CellEditorProps): ReturnType<FC> => {
  const pluginQueryResults = useMemo(
    () => cellPlugins.map((plugin) => plugin.query(type, value)),
    [type, value]
  );

  const activePlugins = useMemo(
    () => cellPlugins.filter((_, index) => pluginQueryResults[index]),
    /**
     * The following line should NOT be `[pluginQueryResults]`. Using the array
     * of booleans as the dependency array ensures that `activePlugins` is only
     * updated when a plugin is enabled or disabled.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pluginQueryResults
  );

  // Remount component when `activePlugins` changes (since hooks may change)
  const prevActivePlugins = useRef(activePlugins);
  const keyRef = useRef(0);
  if (prevActivePlugins.current !== activePlugins) {
    prevActivePlugins.current = activePlugins;
    keyRef.current++;
  }
  const key = keyRef.current;

  const CustomComponent = useMemo(
    () => activePlugins.find(({ customCell }) => customCell)?.customCell,
    [activePlugins]
  );

  const props: CellProps = {
    isTableFrozen,
    element,
    path,
    cellType: type,
    plugins: activePlugins,
    value,
    renderComputedValue,
    eventTarget,
    onChange: onValueChange,
    onConvertToFormula,
    onSelectNextCell,
    onEditingChange,
  };

  const Component = CustomComponent ?? CellEditorDefault;
  return <Component key={key} {...props} />;
};
