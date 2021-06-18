import React from 'react';
import { render } from 'test-utils';
import { Type } from '@decipad/language';
import { Result } from './Result.component';

describe('Result Block', () => {
  it('renders', () => {
    const { container } = render(
      <Result type={Type.Number} value={[3]} errors={[]} />
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot for a number', () => {
    const { container } = render(
      <Result type={Type.Number} value={[3]} errors={[]} />
    );

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for a column', () => {
    const { container } = render(
      <Result
        type={Type.buildColumn(Type.Number, 3)}
        value={[[1, 2, 3]]}
        errors={[]}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for a column of columns', () => {
    const { container } = render(
      <Result
        type={Type.buildColumn(Type.buildColumn(Type.String, 2), 3)}
        value={[
          [
            ['1', '2'],
            ['3', '4'],
            ['5', '6'],
          ],
        ]}
        errors={[]}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
