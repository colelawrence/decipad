import { render } from '@testing-library/react';
import { Callout } from './Callout';

it('renders a callout icon', () => {
  const { getByTitle } = render(<Callout />);
  expect(getByTitle(/callout/i)).toBeInTheDocument();
});
