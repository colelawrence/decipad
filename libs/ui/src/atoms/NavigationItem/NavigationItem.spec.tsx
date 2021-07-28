import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noop } from '../../utils';
import { NavigationItem } from './NavigationItem';

it('renders a list item with the children', () => {
  const { getByRole } = render(
    <NavigationItem onClick={noop}>Text</NavigationItem>
  );
  expect(getByRole('listitem')).toHaveTextContent('Text');
});

it('can render a button and emit click events', () => {
  const handleClick = jest.fn();
  const { getByRole } = render(
    <NavigationItem onClick={handleClick}>Text</NavigationItem>
  );

  userEvent.click(getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
it('can render a link with an href', () => {
  const { getByRole } = render(<NavigationItem href="/">Text</NavigationItem>);
  expect(getByRole('link')).toHaveAttribute('href', '/');
});

it('renders an optional icon', () => {
  const { getByTitle } = render(
    <NavigationItem
      onClick={noop}
      icon={
        <svg>
          <title>Pretty Icon</title>
        </svg>
      }
    >
      Text
    </NavigationItem>
  );
  expect(getByTitle('Pretty Icon')).toBeInTheDocument();
});
