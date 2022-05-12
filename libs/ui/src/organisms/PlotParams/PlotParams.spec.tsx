import { render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { PlotParams } from './PlotParams';

const expectedPropToLabelName = {
  sourceVarName: /table/i,
  markType: /chart/i,
  xColumnName: /horizontal/i,
  yColumnName: /vertical/i,
  sizeColumnName: /size/i,
  colorColumnName: /colors/i,
  thetaColumnName: /slice/i,
  colorSchemeColumnName: /scheme/i,
};

describe('PlotParams', () => {
  const props: Record<string, string> = {};

  const setter = (prop: string) => (value: string) => {
    props[prop] = value;
  };

  const params: ComponentProps<typeof PlotParams> = {
    sourceVarName: 'source var name',
    sourceVarNameOptions: [
      'source var name option 1',
      'source var name option 2',
    ],
    columnNameOptions: ['column name option 1', 'column name option 2'],
    markType: 'circle',
    xColumnName: 'x column name',
    yColumnName: 'y column name',
    sizeColumnName: 'size column name',
    colorColumnName: 'color column name',
    thetaColumnName: 'theta column name',
    colorScheme: 'color scheme',
    setSourceVarName: setter('sourceVarName'),
    setMarkType: setter('markType'),
    setXColumnName: setter('xColumnName'),
    setYColumnName: setter('yColumnName'),
    setSizeColumnName: setter('sizeColumnName'),
    setColorColumnName: setter('colorColumnName'),
    setThetaColumnName: setter('thetaColumnName'),
    setColorScheme: setter('colorScheme'),
  };

  it('has right selectors when mark type is bar', () => {
    const { getByLabelText } = render(
      <PlotParams {...params} markType="bar" />
    );
    expect(getByLabelText(expectedPropToLabelName.xColumnName)).toBeVisible();
    expect(getByLabelText(expectedPropToLabelName.yColumnName)).toBeVisible();
    expect(
      getByLabelText(expectedPropToLabelName.sizeColumnName)
    ).toBeVisible();
    expect(
      getByLabelText(expectedPropToLabelName.colorColumnName)
    ).toBeVisible();
  });

  it('has right selectors when mark type is arc', () => {
    const { getByLabelText } = render(
      <PlotParams {...params} markType="arc" />
    );
    expect(
      getByLabelText(expectedPropToLabelName.sizeColumnName)
    ).toBeVisible();
    expect(
      getByLabelText(expectedPropToLabelName.thetaColumnName)
    ).toBeVisible();
    expect(
      getByLabelText(expectedPropToLabelName.colorSchemeColumnName)
    ).toBeVisible();
  });

  it('has right selectors when mark type is anything else', () => {
    const { getByLabelText } = render(
      <PlotParams {...params} markType="line" />
    );
    expect(getByLabelText(expectedPropToLabelName.xColumnName)).toBeVisible();
    expect(getByLabelText(expectedPropToLabelName.yColumnName)).toBeVisible();
  });
});
