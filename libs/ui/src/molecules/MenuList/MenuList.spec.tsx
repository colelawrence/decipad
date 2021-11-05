import { fireEvent, render } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { MenuList } from './MenuList';
import { MenuItem, TriggerMenuItem } from '../../atoms';

it('renders the button', () => {
  const { queryAllByRole, getByText } = render(
    <MenuList trigger={<button>Click me</button>}>
      <MenuItem>Text</MenuItem>
    </MenuList>
  );

  expect(getByText('Click me')).toBeInTheDocument();
  expect(queryAllByRole('menuitem')).toHaveLength(0);
});

it('renders the dropdown when the button is clicked', async () => {
  const { findAllByRole, getByText } = render(
    <MenuList trigger={<button>Click me</button>}>
      <MenuItem>Text1</MenuItem>
      <MenuItem>Text2</MenuItem>
    </MenuList>
  );

  // Dropdown trigger uses a pointerdown event
  fireEvent.pointerDown(getByText('Click me'));

  expect(await findAllByRole('menuitem')).toHaveLength(2);
});

it('renders the dropdown but not the nested dropdown', async () => {
  const { findAllByRole, getByText } = render(
    <MenuList trigger={<button>Click me</button>}>
      <MenuItem>Text1</MenuItem>
      <MenuList trigger={<TriggerMenuItem>Text 2</TriggerMenuItem>}>
        <MenuItem>Text 2.1</MenuItem>
        <MenuItem>Text 2.2</MenuItem>
      </MenuList>
    </MenuList>
  );

  fireEvent.pointerDown(getByText('Click me'));

  expect(await findAllByRole('menuitem')).toHaveLength(2);
});

it('renders the nested dropdown when the trigger item is clicked', async () => {
  const { findAllByRole, findByText, getByText } = render(
    <MenuList trigger={<button>Click me</button>}>
      <MenuItem>Text1</MenuItem>
      <MenuList trigger={<TriggerMenuItem>Text 2</TriggerMenuItem>}>
        <MenuItem>Text 2.1</MenuItem>
        <MenuItem>Text 2.2</MenuItem>
      </MenuList>
    </MenuList>
  );

  fireEvent.pointerDown(getByText('Click me'));

  // For some reason the nested dropdown trigger uses a click event, maybe
  // because internally it's a different package in the monorepo.
  userEvent.click(await findByText('Text 2'));

  expect(await findAllByRole('menuitem')).toHaveLength(4);
});
