import { render } from '@testing-library/react';
import { Chevron } from './Chevron';

it.each(['expand', 'collapse'] as const)(
  'renders a caret of type %s',
  (type) => {
    const { getByTitle } = render(<Chevron type={type} />);
    expect(getByTitle(new RegExp(type, 'i'))).toBeInTheDocument();
  }
);
