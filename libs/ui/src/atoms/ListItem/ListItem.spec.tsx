import { render } from '@testing-library/react';
import { ListItem } from './ListItem';

it('renders the children', () => {
  const { getByText } = render(<ListItem>text</ListItem>);
  expect(getByText('text')).toBeVisible();
});
