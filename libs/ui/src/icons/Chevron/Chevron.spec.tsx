import { render, screen } from '@testing-library/react';
import { Chevron } from './Chevron';

it.each(['expand', 'collapse'] as const)(
  'renders a caret of type %s',
  (type) => {
    render(<Chevron type={type} />);
    expect(screen.getByTitle(new RegExp(type, 'i'))).toBeInTheDocument();
  }
);
