import { render } from '@testing-library/react';
import { TinyArrow } from './TinyArrow';

it.each(['right', 'down'] as const)(
  'renders an arrow in direction %s',
  (direction) => {
    const { getByTitle } = render(<TinyArrow direction={direction} />);
    expect(getByTitle(new RegExp(direction, 'i'))).toBeInTheDocument();
  }
);
