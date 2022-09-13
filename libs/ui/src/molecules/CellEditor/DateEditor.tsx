import { FC, ReactNode, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import type { SerializedTypes } from '@decipad/computer';
import { CellValueType } from '@decipad/editor-types';
import { dateFormatForGranularity } from '../../utils/dateFormatForGranularity';
import 'react-datepicker/dist/react-datepicker.css';

export interface DateEditorProps {
  open: boolean;
  children?: ReactNode;
  type?: CellValueType;
  value?: string;
  onChangeValue: (
    value: string | undefined // only booleans for now
  ) => void;
}

const showTimeInputForGranularity: Partial<
  Record<SerializedTypes.Date['date'], boolean>
> = {
  hour: true,
  minute: true,
  second: true,
  millisecond: true,
};

// Careful: we use date editors for text input because otherwise
// the cursor would jump when the inferred cell type changes...

export const DateEditor: FC<DateEditorProps> = ({
  open,
  children,
  value = '',
  onChangeValue: _onChangeValue,
  type,
}) => {
  const dateFormat = useMemo(
    () => type && type.kind === 'date' && dateFormatForGranularity(type),
    [type]
  );

  const dateValue = useMemo(() => {
    if (dateFormat) {
      const d = parse(value, dateFormat, new Date());
      return d != null && !Number.isNaN(d.valueOf()) ? d : undefined;
    }
    return undefined;
  }, [dateFormat, value]);

  const onChangeValue = useCallback(
    (newValue: Date | null) => {
      if (newValue != null && dateFormat) {
        _onChangeValue(format(newValue, dateFormat));
      }
    },
    [_onChangeValue, dateFormat]
  );

  return (
    <DatePicker
      open={open && type?.kind === 'date'}
      dateFormat={dateFormat || 'yyyy-MM-dd'}
      selected={dateValue}
      onChange={onChangeValue}
      customInput={<>{children}</>}
      showTimeSelect={
        type?.kind === 'date' && showTimeInputForGranularity[type.date]
      }
      showMonthYearPicker={type?.kind === 'date' && type.date === 'month'}
      showYearPicker={type?.kind === 'date' && type.date === 'year'}
      portalId="date-picker-portal"
    ></DatePicker>
  );
};
