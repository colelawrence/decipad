import { ComponentProps } from 'react';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { DisplayWidget } from './DisplayWidget';

const props: ComponentProps<typeof DisplayWidget> = {
  openMenu: false,
  onChangeOpen: noop,
  result: 'Result',
  readOnly: false,
  children: [],
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
      }}
    />
  );

  // Using query by text, because get by text throws an error.
  expect(queryByText('Variable #1')).not.toBeInTheDocument();
});

it('shows 0 as a placeholder', async () => {
  const { getByText } = render(<DisplayWidget {...props} result={null} />);

  expect(getByText('0')).toBeVisible();
  expect(getByText('Name')).toBeVisible();
});
