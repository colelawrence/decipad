import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MenuItem } from './MenuItem';
import { MenuList } from '../../molecules';

// MenuItem must be created instantiated inside a MenuList
const renderMenu = (children: React.ReactNode) =>
  render(
    <MenuList defaultOpen trigger={<span></span>}>
      {children}
    </MenuList>
  );

it('renders the children', () => {
  const { getByText } = renderMenu(<MenuItem>Text</MenuItem>);
  expect(getByText('Text')).toBeInTheDocument();
});

it('is clickable', () => {
  const handleSelect = jest.fn();
  const { getByRole } = renderMenu(
    <MenuItem onSelect={handleSelect}>Text</MenuItem>
  );

  userEvent.click(getByRole('menuitem'));
  expect(handleSelect).toHaveBeenCalled();
});

it('renders an optional icon', () => {
  const { getByTitle } = renderMenu(
    <MenuItem
      icon={
        <svg>
          <title>Pretty Icon</title>
        </svg>
      }
    >
      Text
    </MenuItem>
  );
  expect(getByTitle('Pretty Icon')).toBeInTheDocument();
});
