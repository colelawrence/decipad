import styled from '@emotion/styled';
import type { HTMLAttributes } from 'react';
import { useEffect, useState, memo } from 'react';
import DatePicker from 'react-datepicker';
import {
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addQuarters,
  subQuarters,
  addYears,
  subYears,
} from 'date-fns';
// eslint-disable-next-line import/no-extraneous-dependencies
import { offset } from '@floating-ui/dom';
import { cssVar, p13Bold, p13Regular, p14Medium } from '@decipad/ui';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CaretDown } from 'libs/ui/src/icons';
import {
  getPeriodComparison,
  Interval,
  intervals,
  LastPeriod,
} from '@decipad/notebook-tabs';

const inputSizes = { Day: 114, Week: 114, Month: 100, Quarter: 100, Year: 80 };

type TimePeriodProps = {
  onChange: ({
    startDate,
    beginStartDate,
    endDate,
    compareStartDate,
    compareEndDate,
    interval,
    lastPeriod,
  }: {
    startDate: Date | null;
    beginStartDate: Date | null;
    endDate: Date | null;
    compareStartDate: Date | null;
    compareEndDate: Date | null;
    interval: Interval;
    lastPeriod: LastPeriod;
  }) => void;
  startDate?: string;
  interval?: Interval;
  lastPeriod?: LastPeriod;
};

export const TimePeriod = memo(
  ({
    onChange,
    startDate: initialStartDate,
    interval: initialInterval,
    lastPeriod: initialLastPeriod,
    ...props
  }: TimePeriodProps & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>) => {
    const [startDate, setStartDate] = useState<Date | null>(
      initialStartDate ? new Date(initialStartDate) : null
    );

    const [interval, setInterval] = useState<Interval>(
      initialInterval ?? 'Month'
    );

    const [lastPeriod, setLastPeriod] = useState<LastPeriod>(
      initialLastPeriod ?? 'last-period'
    );
    const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setInterval(e.target.value as Interval);
    };

    const handlePrevious = () => {
      switch (interval.toLowerCase()) {
        case 'day':
          setStartDate((date) => (date ? subDays(date, 1) : null));
          break;
        case 'week':
          setStartDate((date) => (date ? subWeeks(date, 1) : null));
          break;
        case 'month':
          setStartDate((date) => (date ? subMonths(date, 1) : null));
          break;
        case 'quarter':
          setStartDate((date) => (date ? subQuarters(date, 1) : null));
          break;
        case 'year':
          setStartDate((date) => (date ? subYears(date, 1) : null));
          break;
      }
    };

    const handleNext = () => {
      switch (interval.toLowerCase()) {
        case 'day':
          setStartDate((date) => (date ? addDays(date, 1) : null));
          break;
        case 'week':
          setStartDate((date) => (date ? addWeeks(date, 1) : null));
          break;
        case 'month':
          setStartDate((date) => (date ? addMonths(date, 1) : null));
          break;
        case 'quarter':
          setStartDate((date) => (date ? addQuarters(date, 1) : null));
          break;
        case 'year':
          setStartDate((date) => (date ? addYears(date, 1) : null));
          break;
      }
    };

    useEffect(() => {
      const { beginStartDate, endDate, compareStartDate, compareEndDate } =
        getPeriodComparison(startDate, interval, lastPeriod);

      onChange?.({
        startDate,
        beginStartDate,
        endDate,
        compareStartDate,
        compareEndDate,
        interval,
        lastPeriod,
      });
    }, [startDate, interval, lastPeriod, onChange]);

    const isInvalid = !startDate;
    return (
      <FiltersButtonGroup {...props}>
        <FilterLabel>Time Period is</FilterLabel>

        <DatePickerWrapper>
          <FiltersButton onClick={handlePrevious}>
            <ChevronLeftIcon size={16} />
          </FiltersButton>

          <Relative>
            <DatePicker
              selected={startDate}
              showPopperArrow={false}
              todayButton="Today"
              onChange={setStartDate}
              placeholderText="Invalid period"
              dateFormat={
                interval === 'Day'
                  ? 'MMM dd yyyy'
                  : interval === 'Week'
                  ? "'W'II R"
                  : interval === 'Month'
                  ? 'MMM yyyy'
                  : interval === 'Quarter'
                  ? 'QQQ yyyy'
                  : 'yyyy'
              }
              showQuarterYearPicker={interval === 'Quarter'}
              showMonthYearPicker={interval === 'Month'}
              showYearPicker={interval === 'Year'}
              showWeekPicker={interval === 'Week'}
              showWeekNumbers={interval === 'Week'}
              popperModifiers={[offset(-6)]}
              customInput={
                <FilterInput
                  style={{ width: !startDate ? 140 : inputSizes[interval] }}
                  isInvalid={isInvalid}
                />
              }
              calendarContainer={({ className, children }) => (
                <div className={className}>
                  <SelectWrapper>
                    <Select value={interval} onChange={handleIntervalChange}>
                      {intervals.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                    <IconWrapper>
                      <CaretDown />
                    </IconWrapper>
                  </SelectWrapper>

                  <Relative>{children}</Relative>
                </div>
              )}
            />

            <IconWrapper>
              <CalendarIcon />
            </IconWrapper>
          </Relative>

          <FiltersButton onClick={handleNext}>
            <ChevronRightIcon size={16} />
          </FiltersButton>
        </DatePickerWrapper>

        <FilterLabel style={{ opacity: isInvalid ? 0.5 : 1 }}>
          Compare to
        </FilterLabel>

        <FilterDropdown
          name="compare-to"
          value={lastPeriod}
          onChange={(e) => setLastPeriod(e.target.value as LastPeriod)}
          style={{ opacity: isInvalid ? 0.5 : 1 }}
        >
          <option value="last-period">Last {interval}</option>
          {interval !== 'Year' && <option value="last-year">Last Year</option>}
        </FilterDropdown>
      </FiltersButtonGroup>
    );
  }
);

export const FiltersButtonGroup = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  borderRadius: '4px',
  width: 'fit-content',

  '&>:first-child': {
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px',
  },
  '&>:last-child': {
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
  },
});
export const FilterDropdown = styled.select({
  ...p13Bold,
  ...p13Bold,
  textAlign: 'center',
  height: '24px',
  padding: '6px 8px',
  appearance: 'none',
  backgroundColor: cssVar('backgroundDefault'),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

export const FilterInput = styled.input<{ isInvalid?: boolean }>(
  ({ isInvalid }) => ({
    ...p13Bold,
    textAlign: 'center',
    paddingLeft: 20,
    height: '24px',
    backgroundColor: cssVar('backgroundDefault'),
    '&:focus': {
      backgroundColor: cssVar('backgroundHeavy'),
      outline: 'none',
    },
    '&:hover': {
      backgroundColor: cssVar('backgroundHeavy'),
    },
    ...(isInvalid && {
      color: cssVar('stateDangerBackground'),
      '&::placeholder': {
        // color: cssVar('stateDangerBackground'),
        textDecoration: 'underline',
        textDecorationColor: cssVar('stateDangerBackground'),
        textDecorationThickness: 1,
        textUnderlineOffset: 0.5,
        textDecorationStyle: 'wavy',
      },
    }),
  })
);

export const FilterLabel = styled.div({
  ...p13Regular,
  height: '24px',
  padding: '6px 8px',
  textAlign: 'center',
  color: cssVar('textSubdued'),
  backgroundColor: cssVar('backgroundDefault'),
});

export const FiltersButton = styled.button({
  background: 'transparent',
  textAlign: 'center',
  padding: '4px',
  backgroundColor: cssVar('backgroundDefault'),
  '&:focus-visible': {
    outline: `2px solid ${cssVar('focusOutline')}`,
    outlineOffset: '-2px',
  },
  '&:hover': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

const Relative = styled.div({
  position: 'relative',
});

const IconWrapper = styled.div({
  width: '16px',
  height: '16px',
  position: 'absolute',
  left: 8,
  top: '50%',
  transform: 'translateY(-50%)',
  color: cssVar('textDefault'),
  svg: {
    width: '100%',
    height: '100%',
  },
  pointerEvents: 'none',
});

const DatePickerWrapper = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  width: 'auto',
});

const SelectWrapper = styled.div({
  position: 'relative',
  padding: '2px 8px',

  [`${IconWrapper}`]: {
    position: 'absolute',
    right: 20,
    left: 'auto',
  },
});

const Select = styled.select({
  ...p14Medium,
  width: '100%',
  height: '100%',
  borderRadius: '8px',
  padding: '6px 8px',
  appearance: 'none',

  textAlign: 'center',

  border: '3px solid ',
  borderColor: cssVar('borderSubdued'),
});
