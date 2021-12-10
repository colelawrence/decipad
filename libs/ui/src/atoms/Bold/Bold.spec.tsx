import { render } from '@testing-library/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { Bold } from './Bold';

it('renders the children with increased font weight', () => {
  const { getByText } = render(<Bold>text</Bold>);
  expect(
    Number(findParentWithStyle(getByText('text'), 'fontWeight')!.fontWeight)
  ).toBeGreaterThan(400);
});
