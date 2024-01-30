import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { runCode } from '../../../test-utils';
import { DisplayWidget } from './DisplayWidget';

const props: ComponentProps<typeof DisplayWidget> = {
  openMenu: false,
  onChangeOpen: noop,
  result: 'Result',
  readOnly: false,
  children: [],
  allResults: [],
};

it('renders display widget with result', async () => {
  const code = await runCode('1 + 1');
  const { getByText } = render(
    <DisplayWidget
      {...props}
      lineResult={{
        type: 'computer-result',
        id: 'id',
        result: {
          type: code.type,
          value: code.value,
        },
        epoch: 1n,
      }}
    />
  );

  expect(getByText('2')).toBeInTheDocument();
});

it('dropdown menu not present', async () => {
  const code = await runCode('1 + 1');
  const { queryByText } = render(
    <DisplayWidget
      {...props}
      lineResult={{
        type: 'computer-result',
        id: 'id',
        result: {
          type: code.type,
          value: code.value,
        },
        epoch: 1n,
      }}
    />
  );

  // Using query by text, because get by text throws an error.
  expect(queryByText('Variable #1')).not.toBeInTheDocument();
});

it('shows 0 as a placeholder', () => {
  const { getByText } = render(<DisplayWidget {...props} />);

  expect(getByText('0')).toBeVisible();
  expect(getByText('Result')).toBeVisible();
});
