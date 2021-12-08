import { render } from '@testing-library/react';
import { findParentWithStyle } from '../../test-utils';
import { Underline } from './Underline';

it('renders the children underlined', () => {
  const { getByText } = render(<Underline>text</Underline>);
  expect(
    findParentWithStyle(getByText('text'), 'textDecoration')!.textDecoration
  ).toBe('underline');
});
