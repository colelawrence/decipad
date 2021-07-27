import userEvent from '@testing-library/user-event';
import { render } from 'test-utils';

import { IconButton } from './IconButton';

it('renders the button icon', () => {
  const { getByTitle } = render(
    <IconButton>
      <svg>
        <title>Pretty Icon</title>
      </svg>
    </IconButton>
  );
  expect(getByTitle('Pretty Icon')).toBeInTheDocument();
});

it('emits click events', () => {
  const handleClick = jest.fn();
  const { getByRole } = render(
    <IconButton onClick={handleClick}>icon</IconButton>
  );

  userEvent.click(getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
