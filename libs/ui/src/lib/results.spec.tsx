import { Type } from '@decipad/language';

import { DateResult, NumberResult, TimeUnitsResult } from '../atoms';
import {
  ColumnResult,
  InlineColumnResult,
  RangeResult,
  TableResult,
} from '../organisms';

import {
  DefaultResult,
  getResultTypeComponent,
  FunctionResult,
  InlineTableResult,
} from './results';

it('matches number result type', () => {
  const props = {
    value: undefined,
    type: { type: 'number' } as Type,
  } as const;
  expect(getResultTypeComponent(props)).toBe(NumberResult);
});

it('matches date result type', () => {
  const props = {
    value: undefined,
    type: { date: 'day' } as Type,
  } as const;
  expect(getResultTypeComponent(props)).toBe(DateResult);
});

it('matches table result type', () => {
  const props = {
    value: undefined,
    variant: 'block',
    type: { columnTypes: {} } as Type,
  } as const;
  expect(getResultTypeComponent(props)).toBe(TableResult);
});

it('matches column result type', () => {
  const props = {
    value: [10, 20, 30],
    variant: 'block',
    type: { columnSize: 3 } as Type,
  } as const;
  expect(getResultTypeComponent(props)).toBe(ColumnResult);
});

it('matches inline table result type', () => {
  const props = {
    value: undefined,
    variant: 'inline',
    type: { columnTypes: {} } as Type,
  } as const;
  expect(getResultTypeComponent(props)).toBe(InlineTableResult);
});

it('matches inline column result type', () => {
  const props = {
    value: [10, 20, 30],
    variant: 'inline',
    type: { columnSize: 3 } as Type,
  } as const;
  expect(getResultTypeComponent(props)).toBe(InlineColumnResult);
});

it('matches function result type', () => {
  const props = {
    value: undefined,
    type: { functionness: true } as Type,
  } as const;
  expect(getResultTypeComponent(props)).toBe(FunctionResult);
});

it('matches time units result type', () => {
  const props = {
    value: undefined,
    type: { timeUnits: ['day'] } as Type,
  } as const;
  expect(getResultTypeComponent(props)).toBe(TimeUnitsResult);
});

it('matches range result type', () => {
  const props = {
    value: undefined,
    type: { rangeOf: { type: 'number' } } as Type,
  } as const;
  expect(getResultTypeComponent(props)).toBe(RangeResult);
});

it('matches any other types with a default result type', () => {
  expect(
    getResultTypeComponent({
      value: undefined,
      type: { type: 'boolean' } as Type,
    })
  ).toBe(DefaultResult);
  expect(
    getResultTypeComponent({
      value: undefined,
      type: { type: 'string' } as Type,
    })
  ).toBe(DefaultResult);
  expect(
    getResultTypeComponent({
      value: undefined,
      type: { type: 'made-up-type' } as Type,
    })
  ).toBe(DefaultResult);
});
