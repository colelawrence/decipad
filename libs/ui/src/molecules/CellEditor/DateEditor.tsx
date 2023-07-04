/* eslint decipad/css-prop-named-variable: 0 */
import type { SerializedTypes } from '@decipad/computer';
import { CellValueType } from '@decipad/editor-types';
import { useCanUseDom } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { format, parse } from 'date-fns';
import {
  FC,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { dateFormatForGranularity } from '../../utils/dateFormatForGranularity';

const unitStyles = css({
  '&::after': {
    content: 'attr(data-unit)',
    marginLeft: '0.25rem',
  },
});

export interface DateEditorProps {
  open: boolean;
  focused?: boolean;
  isEditable?: boolean;
  children?: ReactNode;
  type?: CellValueType;
  value?: string;
  unit?: string;
  parentType?: 'table' | 'input';
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
  focused = false,
  isEditable = false,
  children,
  value = '',
  unit,
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

  const onClick = useCallback(
    (ev: MouseEvent) => {
      if (open) {
        ev.stopPropagation();
      }
    },
    [open]
  );

  const datePickerWrapperRef = useRef<HTMLSpanElement>(null);

  // DatePicker siblings should have contentEditable=false
  useEffect(() => {
    const element = datePickerWrapperRef.current?.getElementsByClassName(
      'react-datepicker__aria-live'
    )[0];
    if (!element) return;

    element.setAttribute('contenteditable', 'false');
  }, []);

  const customInput = (
    <span data-unit={unit ?? ''} css={unit && unitStyles}>
      {children}
    </span>
  );

  const portalId = useCanUseDom() ? 'date-picker-portal' : undefined;

  return (
    <span
      onClick={onClick}
      className="mydateeditorwrapper"
      ref={datePickerWrapperRef}
    >
      {isEditable && focused ? (
        <DatePicker
          open={open && type?.kind === 'date'}
          dateFormat={dateFormat || 'yyyy-MM-dd'}
          selected={dateValue}
          onChange={onChangeValue}
          customInput={customInput}
          showTimeSelect={
            type?.kind === 'date' && showTimeInputForGranularity[type.date]
          }
          showMonthYearPicker={type?.kind === 'date' && type.date === 'month'}
          showYearPicker={type?.kind === 'date' && type.date === 'year'}
          portalId={portalId}
          todayButton="Today"
          timeClassName={() => 'deci-datepicker-selectable'}
        ></DatePicker>
      ) : (
        customInput
      )}
    </span>
  );
};
