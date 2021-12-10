import { render } from '@testing-library/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { Italic } from './Italic';

it('renders the children in italic', () => {
  const { getByText } = render(<Italic>text</Italic>);
  expect(findParentWithStyle(getByText('text'), 'fontStyle')!.fontStyle).toBe(
    'italic'
  );
});
