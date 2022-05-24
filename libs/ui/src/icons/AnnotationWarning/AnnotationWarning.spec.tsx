import { render, screen } from '@testing-library/react';
import { AnnotationWarning } from './AnnotationWarning';

it('renders an annotation warning icon', () => {
  render(<AnnotationWarning />);
  expect(screen.getByTitle(/annotation warning/i)).toBeInTheDocument();
});
