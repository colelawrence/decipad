import { mockConsoleError } from '@decipad/testutils';
import { render, screen } from '@testing-library/react';
import { InlineMenuItem } from '../../atoms';
import { InlineMenuGroup } from './InlineMenuGroup';

mockConsoleError();

it('renders given items in a group', () => {
  render(
    <InlineMenuGroup title="group">
      <InlineMenuItem
        title="item 0"
        description="desc 0"
        icon={<svg />}
        enabled
      />
      <InlineMenuItem
        title="item 1"
        description="desc 1"
        icon={<svg />}
        enabled
      />
    </InlineMenuGroup>
  );
  expect(screen.getByRole('group')).toHaveTextContent(/item 0.*item 1/);
});

it.each([
  ['text', 'asdf'],
  ['fragment', <>asdf</>],
  ['<li>', <li />],
])('does not allow %s children', (_, children) => {
  expect(() =>
    render(<InlineMenuGroup title="group">{children}</InlineMenuGroup>)
  ).toThrow(/child/i);
});
it.each([
  ['undefined', undefined],
  ['null', null],
  ['boolean', false],
])('allows %s children', (_, children) => {
  expect(() =>
    render(<InlineMenuGroup title="group">{children}</InlineMenuGroup>)
  ).not.toThrow();
});
