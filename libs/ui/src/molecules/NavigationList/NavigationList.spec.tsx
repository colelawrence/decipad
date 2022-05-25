import { mockConsoleError } from '@decipad/testutils';
import { noop } from '@decipad/utils';
import { render, screen } from '@testing-library/react';
import { NavigationItem } from '../../atoms';
import { NavigationList } from './NavigationList';

mockConsoleError();

it('renders a list', () => {
  render(
    <NavigationList>
      <NavigationItem onClick={noop}>Item 1</NavigationItem>
    </NavigationList>
  );
  expect(screen.getByRole('list')).toBeVisible();
});

it('renders each child as a list item', () => {
  render(
    <NavigationList>
      <NavigationItem onClick={noop}>Item 1</NavigationItem>
      {null}
      {undefined}
      <NavigationItem onClick={noop}>Item 2</NavigationItem>
    </NavigationList>
  );
  expect(
    screen.getAllByRole('listitem').map(({ textContent }) => textContent)
  ).toEqual(['Item 1', 'Item 2']);
});

it.each([
  ['text', 'asdf'],
  ['fragment', <>asdf</>],
  ['<li>', <li />],
])('does not allow %s children', (_, children) => {
  expect(() => render(<NavigationList>{children}</NavigationList>)).toThrow(
    /child/i
  );
});
it.each([
  ['undefined', undefined],
  ['null', null],
  ['boolean', false],
])('allows %s children', (_, children) => {
  expect(() =>
    render(<NavigationList>{children}</NavigationList>)
  ).not.toThrow();
});
