import { render } from '@testing-library/react';
import { NotebookListPlaceholder } from './NotebookListPlaceholder';

it('renders a loading placeholder', () => {
  const { getByLabelText } = render(<NotebookListPlaceholder />);
  expect(getByLabelText(/notebook.+loading/i)).toBeVisible();
});
