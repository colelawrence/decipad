import type { Path } from 'slate';
import {
  CellValueType,
  TableCellElement,
  SmartRefElement,
} from '@decipad/editor-types';
import { TText } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

export type CellPlugin = {
  // Determine whether the plugin is active
  query: (cellType?: CellValueType, cellValue?: string) => boolean;

  // Use a custom component to render the cell (defaults to modal editor)
  customCell?: React.ComponentType<CellProps>;

  // Should the cell be editable?
  useEditable?: (editable: boolean, props: CellProps) => boolean;

  // Transform the modal read-only value
  useTransformValue?: (value: string, cellProps: CellProps) => string;

  // Set the text-align of the modal read-only value
  useTextAlign?: (
    align: React.CSSProperties['textAlign'],
    cellProps: CellProps
  ) => React.CSSProperties['textAlign'];

  // Control how the modal read-only value is rendered
  useRenderAboveReadOnly?: (
    children: React.ReactNode,
    cellProps: CellProps
  ) => JSX.Element;

  // Control how the modal text editor is rendered
  useRenderAboveTextEditor?: (
    children: React.ReactNode,
    cellTextEditingProps: CellTextEditingProps
  ) => JSX.Element;
};

// Pipeable options must have the form (value: T, ...rest) => T
export type PipeableCellPluginOptions =
  | (keyof CellPlugin & 'useEditable')
  | 'useTransformValue'
  | 'useTextAlign'
  | 'useRenderAboveReadOnly'
  | 'useRenderAboveTextEditor';

export interface CellProps {
  isTableFrozen: boolean;
  element: TableCellElement;
  path: Path;
  cellType?: CellValueType;
  plugins: CellPlugin[];
  value: string;
  renderComputedValue: boolean;
  eventTarget?: EventTarget;
  onChange?: (value: string) => void;
  onConvertToFormula?: () => void;
  onSelectNextCell?: (
    edge?: 'before' | 'after' | 'top' | 'left' | 'bottom' | 'right'
  ) => void;
  onEditingChange?: (editing: boolean) => void;
}

export interface CellTextEditingProps {
  cellProps: CellProps;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export type CellInputValue = [
  {
    id: string;
    type: typeof ELEMENT_PARAGRAPH;
    children: CellInputInlineValue[];
  }
];

export type CellInputInlineValue = TText | SmartRefElement;

export type ParsedCellValue = (TText | { blockId: string })[];
