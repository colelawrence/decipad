import { AnyElement, CellValueType } from '@decipad/editor-types';
import { Path } from 'slate';
import { FC, HTMLAttributes, useMemo } from 'react';
import type { CellProps } from './types';
import { cellPlugins } from './cell-plugins';
import { CellEditorDefault } from './CellEditorDefault';

export interface CellEditorProps extends HTMLAttributes<HTMLTableCellElement> {
  isTableFrozen?: boolean;
  selected?: boolean;
  focused?: boolean;
  type?: CellValueType;
  value?: string;
  eventTarget?: EventTarget;
  onValueChange?: (value: string) => void;
  onConvertToFormula?: () => void;
  onSelectNextCell?: () => void;
  path: Path;
  element?: AnyElement;
  onEditingChange?: (editing: boolean) => void;
}

export const CellEditor = ({
  isTableFrozen = false,
  type,
  value = '',
  eventTarget,
  onValueChange,
  onConvertToFormula,
  onSelectNextCell,
  path,
  element,
  onEditingChange,
}: CellEditorProps): ReturnType<FC> => {
  const activePlugins = useMemo(() => {
    return cellPlugins.filter(({ query }) => query(type));
  }, [type]);

  const CustomComponent = useMemo(
    () => activePlugins.find(({ customCell }) => customCell)?.customCell,
    [activePlugins]
  );

  // Remount component when cell type changes (since hooks may change)
  const key = element ? `${element.id}-${type?.kind}` : type?.kind;

  const props: CellProps = {
    isTableFrozen,
    element,
    path,
    cellType: type,
    plugins: activePlugins,
    value,
    eventTarget,
    onChange: onValueChange,
    onConvertToFormula,
    onSelectNextCell,
    onEditingChange,
  };

  const Component = CustomComponent ?? CellEditorDefault;
  return <Component key={key} {...props} />;
};
