import { render, screen } from '@testing-library/react';
import { TinyArrow } from './TinyArrow';

it.each(['right', 'down'] as const)(
  'renders an arrow in direction %s',
  (direction) => {
    render(<TinyArrow direction={direction} />);
    expect(screen.getByTitle(new RegExp(direction, 'i'))).toBeInTheDocument();
  }
);
