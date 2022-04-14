import { ComponentProps } from 'react';
import { Router, MemoryRouter, StaticRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { css } from '@emotion/react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { docs } from '@decipad/routing';
import { mockConsoleError } from '@decipad/testutils';
import { Anchor, resolveHref } from './link';

type ExpectedHistory = ComponentProps<typeof Router>['history'];

describe('resolveHref', () => {
  it.each`
    externalHref                                                                  | resolvedHref
    ${`https://example.com/`}                                                     | ${`https://example.com/`}
    ${`//example.com/`}                                                           | ${`${window.location.protocol}//example.com/`}
    ${`//${window.location.hostname}:${Number(window.location.port || 80) - 1}/`} | ${`${window.location.protocol}//${window.location.hostname}:${Number(window.location.port || 80) - 1}/`}
    ${`mailto:test@${window.location.hostname}`}                                  | ${`mailto:test@${window.location.hostname}`}
  `(
    "considers an href to '$externalHref' external and resolves it fully",
    ({ externalHref, resolvedHref }) => {
      const { internal, resolved } = resolveHref(externalHref);
      expect(internal).toBe(false);
      expect(resolved).toBe(resolvedHref);
    }
  );

  it.each`
    internalHref                                                                  | strippedHref
    ${`${window.location.protocol}//${window.location.host}`}                     | ${`/`}
    ${`${window.location.protocol}//${window.location.host}/page`}                | ${`/page`}
    ${`//${window.location.host}`}                                                | ${`/`}
    ${`//${window.location.host}/page`}                                           | ${`/page`}
    ${`/`}                                                                        | ${`/`}
    ${`/page`}                                                                    | ${`/page`}
    ${`.`}                                                                        | ${`/`}
    ${`./page`}                                                                   | ${`/page`}
    ${`..`}                                                                       | ${`/`}
    ${`../page`}                                                                  | ${`/page`}
    ${`page`}                                                                     | ${`/page`}
    ${`#`}                                                                        | ${`/`}
    ${`#fragment`}                                                                | ${`/#fragment`}
    ${`?query=123`}                                                               | ${`/?query=123`}
    ${`${window.location.protocol}//${window.location.host}/page?query#fragment`} | ${`/page?query#fragment`}
  `(
    "considers an href to '$internalHref' internal and strips away the beginning",
    ({ internalHref, strippedHref }) => {
      const { internal, resolved } = resolveHref(internalHref);
      expect(internal).toBe(true);
      expect(resolved).toEqual(strippedHref);
    }
  );
});

describe('Anchor', () => {
  it('renders the text in an anchor', () => {
    const { getByText } = render(<Anchor href="/">text</Anchor>);
    expect(getByText('text').tagName).toBe('A');
  });

  describe.each`
    contextDescription    | wrapper
    ${'with a router'}    | ${StaticRouter}
    ${'without a router'} | ${undefined}
  `('$contextDescription', ({ wrapper }) => {
    describe.each`
      linkDescription                | href
      ${'external link'}             | ${'https://example.com/'}
      ${'internal server-side link'} | ${docs({}).$}
      ${'internal server-side link'} | ${docs({}).page({ name: 'example' }).$}
      ${'internal link'}             | ${'/'}
    `("for an $linkDescription to '$href'", ({ href }) => {
      it('applies the href to the anchor', () => {
        const { getByRole } = render(<Anchor href={href}>text</Anchor>, {
          wrapper,
        });
        const anchor = getByRole('link') as HTMLAnchorElement;
        expect(new URL(anchor.href, window.location.href).href).toBe(
          new URL(href, window.location.href).href
        );
      });
    });

    it('renders an inactive link without an href', () => {
      const { getByText } = render(<Anchor href={undefined}>text</Anchor>, {
        wrapper,
      });
      expect(getByText('text', { selector: 'a' })).not.toHaveAttribute('href');
    });
  });

  describe.each`
    linkDescription                | href
    ${'external link'}             | ${'https://example.com/'}
    ${'internal server-side link'} | ${docs({}).$}
    ${'internal server-side link'} | ${docs({}).page({ name: 'example' }).$}
  `('for an $linkDescription to $href', ({ href }) => {
    it('sets the anchor target to open in a new page', () => {
      const { getByRole } = render(<Anchor href={href}>text</Anchor>);
      const { target } = getByRole('link') as HTMLAnchorElement;
      expect(target).toBe('_blank');
    });

    mockConsoleError();
    it('triggers a full page navigation on click', () => {
      const { getByRole } = render(<Anchor href={href}>text</Anchor>);
      const anchor = getByRole('link') as HTMLAnchorElement;
      expect(fireEvent.click(anchor)).toBe(true);
    });
  });
  describe('for an external link', () => {
    it('secures the link against third parties', () => {
      const { getByRole } = render(
        <Anchor href="https://example.com">text</Anchor>
      );
      const { relList } = getByRole('link') as HTMLAnchorElement;
      expect(relList).toContain('noreferrer');
      expect(relList).toContain('noopener');
    });
  });
  describe('for an internal serer-side link', () => {
    it('does not secure the link against third parties', () => {
      const { getByRole } = render(<Anchor href={docs({}).$}>text</Anchor>);
      const { relList } = getByRole('link') as HTMLAnchorElement;
      expect(relList).not.toContain('noreferrer');
      expect(relList).not.toContain('noopener');
    });
  });

  describe.each`
    description           | wrapper
    ${'with a router'}    | ${StaticRouter}
    ${'without a router'} | ${undefined}
  `('for an internal link $description', ({ wrapper }) => {
    it('does not set the anchor target', () => {
      const { getByRole } = render(<Anchor href="/">text</Anchor>, {
        wrapper,
      });
      const { target } = getByRole('link') as HTMLAnchorElement;
      expect(target).toBe('');
    });

    it('does not secure the link against third parties', () => {
      const { getByRole } = render(<Anchor href="/">text</Anchor>, { wrapper });
      const { relList } = getByRole('link') as HTMLAnchorElement;
      expect(relList).not.toContain('noreferrer');
      expect(relList).not.toContain('noopener');
    });
  });

  describe('for an internal link with a router', () => {
    mockConsoleError();
    it('does not trigger a full page navigation on click', () => {
      const { getByRole } = render(
        <Anchor
          href={`${window.location.protocol}//${window.location.host}/page?query#fragment`}
        >
          text
        </Anchor>,
        { wrapper: StaticRouter }
      );
      const anchor = getByRole('link') as HTMLAnchorElement;
      expect(fireEvent.click(anchor)).toBe(false);
    });

    it('smoothly scrolls the anchor referenced by the fragment into view', async () => {
      const { getByRole } = render(
        <>
          <Anchor href={`#fragment`}>text</Anchor>
          <main id="fragment">text</main>
        </>,
        { wrapper: StaticRouter }
      );
      const main = getByRole('main');
      const spyScrollIntoView = jest.spyOn(main, 'scrollIntoView');

      userEvent.click(getByRole('link'));
      await waitFor(() =>
        expect(spyScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
      );
    });

    describe('and active styles', () => {
      it('applies the active styles only when on the right page', async () => {
        const { getByRole } = render(
          <MemoryRouter>
            <Anchor href="/page" activeStyles={css({ color: 'red' })}>
              text
            </Anchor>
          </MemoryRouter>
        );
        expect(getComputedStyle(getByRole('link')).color).not.toBe('red');

        userEvent.click(getByRole('link'));
        expect(getComputedStyle(getByRole('link')).color).toBe('red');
      });

      it('does not apply the active styles when on a sub page and exact is set', () => {
        const history = createMemoryHistory({ initialEntries: ['/page'] });
        const { getByText } = render(
          <Router history={history as unknown as ExpectedHistory}>
            <Anchor exact href="/page" activeStyles={css({ color: 'red' })}>
              text
            </Anchor>
          </Router>
        );
        expect(getComputedStyle(getByText('text')).color).toBe('red');

        history.push('/page/child');
        expect(getComputedStyle(getByText('text')).color).not.toBe('red');
      });
    });
  });
});
