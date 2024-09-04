import { it, expect } from 'vitest';
import { mockConsoleError } from '@decipad/testutils';
import { render, screen } from '@testing-library/react';
import { AutoCompleteMenuItem } from '../AutoCompleteMenuItem/AutoCompleteMenuItem';
import { AutoCompleteMenuGroup } from './AutoCompleteMenuGroup';

mockConsoleError();

it('renders given items in a group', () => {
  render(
    <AutoCompleteMenuGroup title="group">
      <AutoCompleteMenuItem
        item={{
          autocompleteGroup: 'variable',
          kind: 'number',
          name: 'ThisIsAVariable',
        }}
      />
      <AutoCompleteMenuItem
        item={{
          autocompleteGroup: 'variable',
          kind: 'number',
          name: 'ThisIsAnother',
        }}
      />
    </AutoCompleteMenuGroup>
  );
  expect(screen.getByRole('group')).toHaveTextContent(
    /ThisIsAVariable.*ThisIsAnother/
  );
});

it.each([
  ['text', 'asdf'],
  ['fragment', <>asdf</>],
  ['<li>', <li />],
])('does not allow %s children', (_, children) => {
  expect(() =>
    render(
      <AutoCompleteMenuGroup title="group">{children}</AutoCompleteMenuGroup>
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
      <AutoCompleteMenuGroup title="group">{children}</AutoCompleteMenuGroup>
    )
  ).not.toThrow();
});
