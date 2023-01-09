import { render } from '@testing-library/react';
import { DropdownOption } from './DropdownOption';

it('renders the dropdown option', () => {
  const { getByDisplayValue } = render(
    <DropdownOption value="Hello" setValue={() => {}} />
  );
  expect(getByDisplayValue('Hello')).toBeVisible();
});
