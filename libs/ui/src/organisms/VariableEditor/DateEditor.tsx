import { FC, ReactNode, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import type { SerializedTypes } from '@decipad/computer';
import { CellValueType } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { dateFormatForGranularity } from '../../utils/dateFormatForGranularity';
import 'react-datepicker/dist/react-datepicker.css';

export interface DateEditorProps {
  children?: ReactNode;
  type?: CellValueType;
  value?: string;
  onChangeValue?: (
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

export const DateEditor: FC<DateEditorProps> = ({
  children,
  value = '',
  onChangeValue: _onChangeValue = noop,
  type,
}) => {
  const dateFormat = useMemo(() => dateFormatForGranularity(type), [type]);

  const dateValue = useMemo(() => {
    const d = parse(value, dateFormat, new Date());
    return d != null && !Number.isNaN(d.valueOf()) ? d : undefined;
  }, [dateFormat, value]);

  const onChangeValue = useCallback(
    (newValue: Date | null) => {
      if (newValue != null) {
        _onChangeValue(format(newValue, dateFormat));
      }
    },
    [_onChangeValue, dateFormat]
  );

  return (
    <div contentEditable={false}>
      <DatePicker
        dateFormat={dateFormat}
        selected={dateValue}
        onChange={onChangeValue}
        customInput={<div>{children}</div>}
        showTimeSelect={
          type?.kind === 'date' && showTimeInputForGranularity[type.date]
        }
        showMonthYearPicker={type?.kind === 'date' && type.date === 'month'}
        showYearPicker={type?.kind === 'date' && type.date === 'year'}
      ></DatePicker>
    </div>
  );
};
