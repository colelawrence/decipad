import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MenuWrapper as wrapper } from '../../test-utils';
import { MenuItem } from './MenuItem';

it('renders the children', () => {
  const { getByText } = render(<MenuItem>Text</MenuItem>, { wrapper });
  expect(getByText('Text')).toBeInTheDocument();
});

it('is clickable', () => {
  const handleSelect = jest.fn();
  const { getByRole } = render(
    <MenuItem onSelect={handleSelect}>Text</MenuItem>,
    { wrapper }
  );

  userEvent.click(getByRole('menuitem'));
  expect(handleSelect).toHaveBeenCalled();
});

it('renders an optional icon', () => {
  const { getByTitle } = render(
    <MenuItem
      icon={
        <svg>
          <title>Pretty Icon</title>
        </svg>
      }
    >
      Text
    </MenuItem>,
    { wrapper }
  );
  expect(getByTitle('Pretty Icon')).toBeInTheDocument();
});
