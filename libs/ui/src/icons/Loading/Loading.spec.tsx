import { render } from '@testing-library/react';
import { Loading } from './Loading';

it('renders a server icon', () => {
  const { getByTitle } = render(<Loading />);
  expect(getByTitle(/loading/i)).toBeInTheDocument();
});
