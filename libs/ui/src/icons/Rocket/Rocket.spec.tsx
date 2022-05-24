import { render, screen } from '@testing-library/react';
import { Rocket } from './Rocket';

it('renders a rocket icon', () => {
  render(<Rocket />);
  expect(screen.getByTitle(/rocket/i)).toBeInTheDocument();
});
