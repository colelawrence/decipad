import { render } from '@testing-library/react';
import { mockConsoleError } from '@decipad/testutils';
import { AutoCompleteMenuItem } from '../../atoms';
import { AutoCompleteMenuGroup } from './AutoCompleteMenuGroup';

mockConsoleError();

it('renders given items in a group', () => {
  const { getByRole } = render(
    <AutoCompleteMenuGroup title="group">
      <AutoCompleteMenuItem kind="variable" identifier="ThisIsAVariable" />
      <AutoCompleteMenuItem kind="variable" identifier="ThisIsAnother" />
    </AutoCompleteMenuGroup>
  );
  expect(getByRole('group')).toHaveTextContent(
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
