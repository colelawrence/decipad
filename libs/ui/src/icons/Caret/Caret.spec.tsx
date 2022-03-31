import { render } from '@testing-library/react';
import { Caret } from './Caret';

it.each(['down', 'right', 'up'] as const)(
  'renders a caret %s icon',
  (variant) => {
    const { getByTitle } = render(<Caret variant={variant} />);
    expect(getByTitle(new RegExp(variant, 'i'))).toBeInTheDocument();
  }
);
