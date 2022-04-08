import { render } from '@testing-library/react';
import { AnnotationWarning } from './AnnotationWarning';

it('renders an annotation warning icon', () => {
  const { getByTitle } = render(<AnnotationWarning />);
  expect(getByTitle(/annotation warning/i)).toBeInTheDocument();
});
