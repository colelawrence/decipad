import { it, expect } from 'vitest';
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
      id: '1',
      item: 'Hello',
    },
    {
      id: '2',
      item: 'World',
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
