import { render } from '@testing-library/react';
import { Caret } from './Caret';

it.each(['expand', 'collapse'] as const)(
  'renders a caret of type %s',
  (type) => {
    const { getByTitle } = render(<Caret type={type} />);
    expect(getByTitle(new RegExp(type, 'i'))).toBeInTheDocument();
  }
);
