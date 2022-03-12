import { render } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

it('renders the message', () => {
  const { getByText } = render(
    <ErrorMessage message="this is the error message" />
  );
  expect(getByText('this is the error message')).toBeVisible();
});
