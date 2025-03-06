/* eslint decipad/css-prop-named-variable: 0 */
import { useMemo, useCallback } from 'react';
import { format, parse } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCanUseDom } from '@decipad/react-utils';
import { Time } from '@decipad/remote-computer';
import { dateFormatForGranularity } from 'libs/ui/src/utils/dateFormatForGranularity';
import { offset } from '@floating-ui/dom';

export interface DatePickerWrapperProps {
  granularity?: Time.Specificity;
  value: string;
  open?: boolean | null;
  onChange: (value: string) => void;
  onDateChange?: (value: Date) => void;
  customInput?: DatePicker['props']['customInput'];
  children?: React.ReactNode;
}

export const DatePickerWrapper = ({
  granularity,
  value,
  open = true,
  onChange,
  onDateChange,
  customInput,
  children,
}: DatePickerWrapperProps) => {
  // Low overhead; no need to memo
  const dateFormat = dateFormatForGranularity(granularity);

  const dateValue = useMemo(() => {
    if (dateFormat) {
      const d =
        value.length === 0 ? new Date() : parse(value, dateFormat, new Date());
      return d != null && !Number.isNaN(d.valueOf()) ? d : undefined;
    }
    return undefined;
  }, [dateFormat, value]);

  const setDateValue = useCallback(
    (newDateValue: Date | null) => {
      if (newDateValue != null) {
        if (dateFormat) {
          onChange?.(format(newDateValue, dateFormat));
        }
        onDateChange?.(newDateValue);
      }
    },
    [dateFormat, onChange, onDateChange]
  );

  const showTimeSelect = ['hour', 'minute', 'second', 'millisecond'].includes(
    granularity!
  );

  const showMonthYearPicker = granularity === 'month';
  const showYearPicker = granularity === 'year';

  const portalId = useCanUseDom() ? 'date-picker-portal' : undefined;

  /**
   * Putting the children in customInput causes onChange to be called whenever
   * the input is changed to a valid date. The empty fragment and absolute
   * positioning hide DatePicker's default input without breaking its ARIA live
   * region.
   */
  return (
    <>
      <div
        css={{ position: customInput ? undefined : 'absolute' }}
        data-tesid="date-picker"
      >
        <DatePicker
          open={open ?? undefined}
          dateFormat={dateFormat || 'yyyy-MM-dd'}
          selected={dateValue}
          onChange={setDateValue}
          onSelect={setDateValue}
          customInput={customInput ?? <></>}
          showTimeSelect={showTimeSelect}
          showMonthYearPicker={showMonthYearPicker}
          showYearPicker={showYearPicker}
          portalId={portalId}
          todayButton="Today"
          timeClassName={() => 'deci-datepicker-selectable'}
          showPopperArrow={false}
          popperModifiers={[offset(-6) as any]}
        />
      </div>

      {children}
    </>
  );
};
