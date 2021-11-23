import { Type } from '@decipad/language';

import { DateResult, NumberResult, TimeUnitsResult } from '../atoms';
import { RangeResult } from '../organisms';
import { ColumnResult } from './Editor/Blocks/Result/ColumnResult';
import { TableResult } from './Editor/Blocks/Result/TableResult';

import {
  DefaultResult,
  getResultTypeComponent,
  FunctionResult,
} from './results';

it('matches number result type', () => {
  const props = {
    value: undefined,
    type: { type: 'number' } as Type,
  };
  expect(getResultTypeComponent({ ...props })).toBe(NumberResult);
});

it('matches date result type', () => {
  const props = {
    value: undefined,
    type: { date: 'day' } as Type,
  };
  expect(getResultTypeComponent({ ...props })).toBe(DateResult);
});

it('matches table result type', () => {
  const props = {
    value: undefined,
    type: { columnTypes: {} } as Type,
  };
  expect(getResultTypeComponent({ ...props })).toBe(TableResult);
});

it('matches column result type', () => {
  const props = {
    value: [10, 20, 30],
    type: { columnSize: 3 } as Type,
  };
  expect(getResultTypeComponent({ ...props })).toBe(ColumnResult);
});

it('matches function result type', () => {
  const props = {
    value: undefined,
    type: { functionness: true } as Type,
  };
  expect(getResultTypeComponent({ ...props })).toBe(FunctionResult);
});

it('matches time units result type', () => {
  const props = {
    value: undefined,
    type: { timeUnits: ['day'] } as Type,
  };
  expect(getResultTypeComponent({ ...props })).toBe(TimeUnitsResult);
});

it('matches range result type', () => {
  const props = {
    value: undefined,
    type: { rangeOf: { type: 'number' } } as Type,
  };
  expect(getResultTypeComponent({ ...props })).toBe(RangeResult);
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
