import { render } from '@testing-library/react';
import { Folder } from './Folder';

it('renders a folder icon', () => {
  const { getByTitle } = render(<Folder />);
  expect(getByTitle(/folder/i)).toBeInTheDocument();
});
