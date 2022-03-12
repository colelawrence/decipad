import { mockConsoleWarn } from '@decipad/testutils';
import { render, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { PlotResult } from './PlotResult';

const props: ComponentProps<typeof PlotResult> = {
  onError: (err: Error) => {
    throw err;
  },
  spec: {
    data: { name: 'table' },
    encoding: {
      x: { field: 'aa', type: 'nominal' },
      y: {
        field: 'bb',
        type: 'quantitative',
        scale: { domain: [2, 26] },
      },
      size: {
        field: 'bb',
        type: 'quantitative',
        scale: { domain: [2, 26] },
      },
      color: { field: 'aa', type: 'nominal' },
    },
    mark: { type: 'circle', tooltip: true },
  },
  data: {
    table: [
      { aa: 'label 1', bb: 2 },
      { aa: 'label 2', bb: 20 },
      { aa: 'label 3', bb: 26 },
      { aa: 'label 4', bb: 17 },
    ],
  },
};

it('renders a plot', async () => {
  const { findByRole } = render(<PlotResult {...props} />);
  expect(await findByRole('graphics-document')).toBeVisible();
});

it('respects the given spec', async () => {
  const { findAllByText } = render(<PlotResult {...props} />);
  expect(await findAllByText('aa')).not.toHaveLength(0);
});

it('respects the given data', async () => {
  const { findAllByText } = render(<PlotResult {...props} />);
  expect(await findAllByText('label 1')).not.toHaveLength(0);
});

describe('given invalid input', () => {
  mockConsoleWarn();

  it('emits error events', async () => {
    const handleError = jest.fn();
    render(
      <PlotResult
        {...props}
        spec={{
          data: [{ name: 'one' }],
          mark: { type: 'circle' },
        }}
        data={{ two: [] }}
        onError={handleError}
      />
    );
    await waitFor(() => {
      expect(handleError).toHaveBeenCalled();
    });
    const [[err]] = handleError.mock.calls;
    expect(String(err)).toMatch(/one|two/i);
  });
});
