import { expect, describe, it } from 'vitest';
import { N } from '@decipad/number';
import { autoconvertArguments, autoconvertResult } from './autoconvert';
import { fromJS } from '../Value';
import { number } from '../Type';
import { makeContext } from '../Dimension/testUtils';
import { U, u } from '../testUtils';

describe('autoconvert arguments', () => {
  it('autoconverts unitless argument', async () => {
    expect(
      await autoconvertArguments(makeContext(), [fromJS(N(2))], [number()])
    ).toMatchObject([fromJS(N(2))]);
  });

  it('autoconverts unitful (standard unit) argument', async () => {
    expect(
      await autoconvertArguments(
        makeContext(),
        [fromJS(N(2))],
        [number(U('meter'))]
      )
    ).toMatchObject([fromJS(N(2))]);
  });

  it('autoconverts unitful (standard unit and multiplier) argument', async () => {
    expect(
      await autoconvertArguments(
        makeContext(),
        [fromJS(N(200))],
        [number(U('meter', { multiplier: N(100) }))]
      )
    ).toMatchObject([fromJS(N(200))]);
  });

  it('autoconverts expandable (but standard) units', async () => {
    // 2 newton/meter^2 = 2 kilograms.second^-2.meter^-1 = 2000 grams.second^-2.meter^-1
    expect(
      await autoconvertArguments(
        makeContext(),
        [fromJS(N(2))],
        [number(U([u('newton'), u('meter', { exp: N(-2) })]))]
      )
    ).toMatchObject([fromJS(N(2000))]);
  });

  it('autoconverts expandable (but standard) units (2)', async () => {
    // 2 bar
    expect(
      await autoconvertArguments(makeContext(), [fromJS(2)], [number(U('bar'))])
    ).toMatchObject([fromJS(200_000_000)]);
  });

  it('autoconverts non-scalar units', async () => {
    expect(
      await autoconvertArguments(
        makeContext(),
        [fromJS(2)],
        [number(U('celsius'))]
      )
    ).toMatchObject([fromJS(N(27515, 100))]);
  });
});

describe('autoconvert result', () => {
  it('autoconverts unitless result', async () => {
    expect(
      await autoconvertResult(makeContext(), fromJS(N(2)), number(), 'test')
    ).toMatchObject(fromJS(N(2)));
  });

  it('autoconverts unitful (standard unit) argument', async () => {
    expect(
      await autoconvertResult(
        makeContext(),
        fromJS(N(2)),
        number(U('meter')),
        'test'
      )
    ).toMatchObject(fromJS(N(2)));
  });

  it('autoconverts from expandable (but standard) units (2)', async () => {
    expect(
      await autoconvertResult(
        makeContext(),
        fromJS(200_000_000),
        number(U('bar')),
        'test'
      )
    ).toMatchObject(fromJS(N(2)));
  });

  it('autoconverts non-scalar units', async () => {
    expect(
      await autoconvertResult(
        makeContext(),
        fromJS(N(27515, 100)),
        number(U('celsius')),
        'test'
      )
    ).toMatchObject(fromJS(N(2)));
  });
});
