import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { PlotParams } from './PlotParams';

const expectedPropToLabelName = {
  sourceVarName: /var/i,
  markType: /mark/i,
  xColumnName: /horizontal/i,
  yColumnName: /vertical/i,
  sizeColumnName: /size/i,
  colorColumnName: /color/i,
};

describe('PlotParams', () => {
  let props: Record<string, string> = {};

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
    setSourceVarName: setter('sourceVarName'),
    setMarkType: setter('markType'),
    setXColumnName: setter('xColumnName'),
    setYColumnName: setter('yColumnName'),
    setSizeColumnName: setter('sizeColumnName'),
    setColorColumnName: setter('colorColumnName'),
    setThetaColumnName: setter('thetaColumnName'),
  };

  it.each(Object.entries(expectedPropToLabelName))(
    '%s is visible',
    (_propName, labelText) => {
      const { getByLabelText } = render(<PlotParams {...params} />);
      expect(getByLabelText(labelText)).toBeVisible();
    }
  );

  it.each(Object.entries(expectedPropToLabelName))(
    '%s is selectable',
    (propName, labelText) => {
      const { getByLabelText } = render(<PlotParams {...params} />);
      props = {};
      const select =
        propName === 'sourceVarName'
          ? params.sourceVarNameOptions[0]
          : propName === 'markType'
          ? 'circle'
          : params.columnNameOptions[0];
      userEvent.selectOptions(getByLabelText(labelText), select);
      expect(props).toMatchObject({ [propName]: select });
      userEvent.selectOptions(getByLabelText(labelText), '');
      expect(props).toMatchObject({ [propName]: '' });
    }
  );
});
