import { render, screen } from '@testing-library/react';
import { Caret } from './Caret';

it.each(['down', 'right', 'up'] as const)(
  'renders a caret %s icon',
  (variant) => {
    render(<Caret variant={variant} />);
    expect(screen.getByTitle(new RegExp(variant, 'i'))).toBeInTheDocument();
  }
);
