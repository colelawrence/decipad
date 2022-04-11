import { render } from '@testing-library/react';
import { ErrorModal } from './ErrorModal';

it('renders a dialog', () => {
  const { getByRole } = render(<ErrorModal Heading="h1" wellKnown="404" />);
  expect(getByRole('dialog')).toBeVisible();
});

it('shows explanatory text for a 404', () => {
  const { getAllByText } = render(<ErrorModal Heading="h1" wellKnown="404" />);
  expect(getAllByText(/.+/).map(({ textContent }) => textContent))
    .toMatchInlineSnapshot(`
    Array [
      "Something went wrong",
      "The link you tried may be broken, or the page may have been removed.",
      "(The geeks call this a 404 error)",
      "Back to workspace",
    ]
  `);
});
