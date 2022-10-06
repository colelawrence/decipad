import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { ErrorPage } from './ErrorPage';

const props: ComponentProps<typeof ErrorPage> = { Heading: 'h1' };

it('changes the back link if the user is authenticated', () => {
  const { getByRole, rerender } = render(
    <ErrorPage {...props} authenticated={false} />
  );
  const unauthenticatedBackLink = getByRole('link').getAttribute('href');

  rerender(<ErrorPage {...props} authenticated />);
  const authenticatedBackLink = getByRole('link').getAttribute('href');

  expect(authenticatedBackLink).not.toEqual(unauthenticatedBackLink);
});

it('shows default text for an unknown error', () => {
  const { getAllByText } = render(
    <ErrorPage {...props} wellKnown={undefined} />
  );
  expect(getAllByText(/.+/).map(({ textContent }) => textContent))
    .toMatchInlineSnapshot(`
    Array [
      "Sorry, we did something wrong",
      "Decipad isn't accessible right now. We're probably fixing this right now",
      "Back to our website",
    ]
  `);
});

it('shows explanatory text for a 403 error', () => {
  const { getAllByText } = render(<ErrorPage {...props} wellKnown="403" />);
  expect(getAllByText(/.+/).map(({ textContent }) => textContent))
    .toMatchInlineSnapshot(`
    Array [
      "Forbidden",
      "You don't have permissions to access this page.",
      "The geeks call this a 403 error",
      "Back to our website",
    ]
  `);
});

it('shows explanatory text for a 404 error', () => {
  const { getAllByText } = render(<ErrorPage {...props} wellKnown="404" />);
  expect(getAllByText(/.+/).map(({ textContent }) => textContent))
    .toMatchInlineSnapshot(`
    Array [
      "Not found",
      "The link you tried may be broken, or the page may have been removed",
      "The geeks call this a 404 error",
      "Back to our website",
    ]
  `);
});

it('shows explanatory text for a 500 error', () => {
  const { getAllByText } = render(<ErrorPage {...props} wellKnown="500" />);
  expect(getAllByText(/.+/).map(({ textContent }) => textContent))
    .toMatchInlineSnapshot(`
    Array [
      "Sorry, we did something wrong",
      "Decipad isn't accessible right now. We're probably fixing this right now",
      "The geeks call this a 500 error",
      "Back to our website",
    ]
  `);
});
