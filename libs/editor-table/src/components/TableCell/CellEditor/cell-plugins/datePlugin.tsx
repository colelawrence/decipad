import { DatePickerWrapper } from '@decipad/ui';
import { Time } from '@decipad/remote-computer';
import type { CellPlugin } from '../types';
import { matchCellKind } from '../matchCellKind';

export const datePlugin: CellPlugin = {
  query: matchCellKind('date'),
  useRenderAboveTextEditor: (
    children,
    { cellProps: { value, cellType }, onChange, onConfirm }
  ) => {
    const granularity: Time.Specificity =
      cellType?.kind === 'date' ? cellType.date : 'day';

    return (
      <DatePickerWrapper
        granularity={granularity}
        value={value}
        onChange={(newValue) => {
          onChange(newValue);
          onConfirm();
        }}
      >
        {children}
      </DatePickerWrapper>
    );
  },
};
