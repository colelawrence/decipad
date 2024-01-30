import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render, screen } from '@testing-library/react';
import { Bold } from './Bold';

it('renders the children with increased font weight', () => {
  render(<Bold>text</Bold>);
  expect(
    Number(
      findParentWithStyle(screen.getByText('text'), 'fontWeight')!.fontWeight
    )
  ).toBeGreaterThan(400);
});
