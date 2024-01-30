import { render, screen } from '@testing-library/react';
import { ListItemContent } from './ListItemContent';

describe('when active', () => {
  it('renders the children', () => {
    render(<ListItemContent>text</ListItemContent>);
    expect(screen.getByText('text')).toBeVisible();
  });
});
