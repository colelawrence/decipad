import { DateResult, NumberResult, TimeUnitsResult } from '../atoms';
import {
  ColumnResult,
  InlineColumnResult,
  RangeResult,
  TableResult,
} from '../organisms';
import { runCode } from '../test-utils';
import {
  getResultComponent,
  DefaultResult,
  FunctionResult,
  InlineTableResult,
  Variant,
  ResultComponent,
} from './results';

it('matches number result type', async () => {
  expect(getResultComponent(await runCode('1'))).toBe(NumberResult);
});

it('matches scalar result type', async () => {
  expect(getResultComponent(await runCode('true'))).toBe(DefaultResult);
  expect(getResultComponent(await runCode('"foo"'))).toBe(DefaultResult);
});

it('matches date result type', async () => {
  expect(getResultComponent(await runCode('date(2021)'))).toBe(DateResult);
});

it('matches range result type', async () => {
  expect(getResultComponent(await runCode('range(1 .. 10)'))).toBe(RangeResult);
});

describe('column result', () => {
  it.each<[Variant, ResultComponent<'column'>]>([
    ['block', ColumnResult],
    ['inline', InlineColumnResult],
  ])('matches %s result type', async (variant, Component) => {
    expect(
      getResultComponent({ ...(await runCode('[1, 2, 3]')), variant })
    ).toBe(Component);
  });
});

describe('table result', () => {
  it.each<[Variant, ResultComponent<'table'>]>([
    ['block', TableResult],
    ['inline', InlineTableResult],
  ])('matches %s result type', async (variant, Component) => {
    expect(
      getResultComponent({
        ...(await runCode('table = {A = ["A"], B = [1]}')),
        variant,
      })
    ).toBe(Component);
  });
});

it('matches time units result type', async () => {
  expect(
    getResultComponent(await runCode('date(2020-01-11) - date(2020-01-01)'))
  ).toBe(TimeUnitsResult);
});

it('matches function result type', async () => {
  expect(getResultComponent(await runCode('even (n) = n % 2 == 0'))).toBe(
    FunctionResult
  );
});
