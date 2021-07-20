import { render } from '@testing-library/react';

import { noop } from '../../utils';
import { NavigationItem } from '../../atoms';
import { NavigationList } from './NavigationList';
import { mockConsoleError } from '../../test-utils';

mockConsoleError();

it('renders a list with all children', () => {
  const { getByRole } = render(
    <NavigationList>
      <NavigationItem onClick={noop}>Item 1</NavigationItem>
      <NavigationItem onClick={noop}>Item 2</NavigationItem>
    </NavigationList>
  );
  expect(getByRole('list')).toHaveTextContent(/Item 1.*Item 2/);
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
