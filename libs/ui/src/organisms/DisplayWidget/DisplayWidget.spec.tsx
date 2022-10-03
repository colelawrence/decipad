import { ComponentProps } from 'react';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { DisplayWidget } from './DisplayWidget';

const props: ComponentProps<typeof DisplayWidget> = {
  dropdownContent: [
    {
      type: 'var',
      id: '1',
      text: 'Variable #1',
    },
    {
      type: 'var',
      id: '2',
      text: 'Variable #2',
    },
  ],
  openMenu: false,
  onChangeOpen: noop,
  selectedId: '1',
  setSelectedId: noop,
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

it('shows dropdown menu', async () => {
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
      openMenu={true}
    />
  );
  expect(getByText('Variable #1')).toBeInTheDocument();
});

it('doesnt show dropdown menu in readmode', async () => {
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
      openMenu={true}
      readOnly={true}
    />
  );
  expect(queryByText('Variable #1')).not.toBeInTheDocument();
});
