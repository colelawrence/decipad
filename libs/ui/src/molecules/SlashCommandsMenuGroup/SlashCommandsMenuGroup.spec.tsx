import { mockConsoleError } from '@decipad/testutils';
import { render, screen } from '@testing-library/react';
import { SlashCommandsMenuItem } from '../../atoms';
import { SlashCommandsMenuGroup } from './SlashCommandsMenuGroup';

mockConsoleError();

it('renders given items in a group', () => {
  render(
    <SlashCommandsMenuGroup title="group">
      <SlashCommandsMenuItem
        title="item 0"
        description="desc 0"
        icon={<svg />}
        enabled
      />
      <SlashCommandsMenuItem
        title="item 1"
        description="desc 1"
        icon={<svg />}
        enabled
      />
    </SlashCommandsMenuGroup>
  );
  expect(screen.getByRole('group')).toHaveTextContent(/item 0.*item 1/);
});

it.each([
  ['text', 'asdf'],
  ['fragment', <>asdf</>],
  ['<li>', <li />],
])('does not allow %s children', (_, children) => {
  expect(() =>
    render(
      <SlashCommandsMenuGroup title="group">{children}</SlashCommandsMenuGroup>
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
      <SlashCommandsMenuGroup title="group">{children}</SlashCommandsMenuGroup>
    )
  ).not.toThrow();
});
