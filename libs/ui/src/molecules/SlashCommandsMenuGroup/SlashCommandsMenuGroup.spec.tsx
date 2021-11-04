import { render } from '@testing-library/react';
import { SlashCommandsMenuItem } from '../../atoms';

import { MenuWrapper as wrapper } from '../../test-utils';
import { SlashCommandsMenuGroup } from './SlashCommandsMenuGroup';

it('renders given items in a group', () => {
  const { getByRole } = render(
    <SlashCommandsMenuGroup title="group">
      <SlashCommandsMenuItem
        title="item 0"
        description="desc 0"
        icon={<svg />}
      />
      <SlashCommandsMenuItem
        title="item 1"
        description="desc 1"
        icon={<svg />}
      />
    </SlashCommandsMenuGroup>,
    { wrapper }
  );
  expect(getByRole('group')).toHaveTextContent(/item 0.*item 1/);
});

it.each([
  ['text', 'asdf'],
  ['fragment', <>asdf</>],
  ['<li>', <li />],
])('does not allow %s children', (_, children) => {
  expect(() =>
    render(
      <SlashCommandsMenuGroup title="group">{children}</SlashCommandsMenuGroup>,
      { wrapper }
    )
  ).toThrow(/child/i);
});
it.each([
  ['undefined', undefined],
  ['null', null],
  ['boolean', false],
])('allows %s children', (_, children) => {
  expect(() =>
    render(
      <SlashCommandsMenuGroup title="group">{children}</SlashCommandsMenuGroup>,
      { wrapper }
    )
  ).not.toThrow();
});
