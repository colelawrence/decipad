import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { DropdownMenu, DropdownMenuProps } from './DropdownMenu';

const props: Omit<DropdownMenuProps, 'children'> = {
  onExecute: noop,
  open: true,
  setOpen: noop,
  isReadOnly: false,
  items: [
    {
      item: 'Hello',
      focused: true,
    },
    {
      item: 'World',
      focused: false,
    },
  ],
};

it('renders the dropdown menu', () => {
  const { getByText } = render(
    <DropdownMenu {...props}>
      <></>
    </DropdownMenu>
  );
  expect(getByText('Hello')).toBeInTheDocument();
  expect(getByText('World')).toBeInTheDocument();
});
