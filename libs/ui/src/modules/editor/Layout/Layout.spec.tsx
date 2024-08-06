import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';

it('render children', () => {
  render(<Layout>text</Layout>);
  expect(screen.getByText('text')).toBeVisible();
});
