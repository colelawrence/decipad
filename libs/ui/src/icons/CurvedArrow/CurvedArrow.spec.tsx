import { render } from '@testing-library/react';
import { CurvedArrow } from './CurvedArrow';

it('renders a curved arrow', () => {
  const { getByTitle } = render(
    <CurvedArrow title="Curved Arrow" direction="left" active={true} />
  );
  expect(getByTitle(/curved arrow/i)).toBeInTheDocument();
});
