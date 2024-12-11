import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DropdownEditOption } from './DropdownEditOption';

it('renders the dropdown edit option', () => {
  const { getByDisplayValue } = render(
    <DropdownEditOption value="Hello" setValue={() => {}} />
  );
  expect(getByDisplayValue('Hello')).toBeVisible();
});
