import { beforeAll, afterAll, vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import createFetch from 'vitest-fetch-mock';
import { SessionProvider } from 'next-auth/react';
import { ComponentProps } from 'react';
import { runCode } from '../../../test-utils';
import { CodeLine } from './CodeLine';

let tabularProps: ComponentProps<typeof CodeLine>;
let typeErrorProps: ComponentProps<typeof CodeLine>;
const syntaxError = { message: 'Syntax Error', url: 'https://foo' };

describe('CodeLine', () => {
  const fetch = createFetch(vi);

  beforeAll(async () => {
    tabularProps = {
      children: '[1, 2, 3]',
      result: await runCode('[1, 2, 3]'),
    };
    typeErrorProps = {
      children: '1 apple + 1 banana',
      result: {
        value: null,
        type: {
          kind: 'type-error',
          errorCause: {
            errType: 'free-form',
            message: 'some error',
          },
        },
        meta: undefined,
      },
    };
  });

  beforeAll(() => {
    fetch.enableMocks();
  });

  afterAll(() => {
    fetch.disableMocks();
  });

  it('renders children', () => {
    const { getByText } = render(<CodeLine>10</CodeLine>);
    expect(getByText('10')).toBeVisible();
  });

  describe('when result is tabular', () => {
    it('should render the expanded result', async () => {
      const { findByRole } = render(<CodeLine {...tabularProps} highlight />);

      // Wait for the button to be available
      const button = await findByRole('button');
      button.click(); // Show table result

      // Wait for the table to become visible after clicking
      const table = await findByRole('table');
      expect(table).toBeVisible();
    });

    it('should not render the result inline', async () => {
      const { getAllByRole, findAllByRole, findByRole } = render(
        <SessionProvider>
          <CodeLine {...tabularProps} highlight />
        </SessionProvider>
      );
      // Wait for the button to be available
      const button = await findByRole('button');
      button.click(); // Show table result

      // Wait for the table to become visible after clicking
      const table = await findByRole('table');

      const queryInlineResultElement = async () =>
        (await findAllByRole('status')).find(
          (element) => element!.textContent === '1, 2, 3'
        ) as HTMLElement;

      expect(getAllByRole('status')).toHaveLength(1);
      expect(await queryInlineResultElement()).toBe(undefined);
      expect(table).toBeVisible();
    });
  });

  describe('when result is an error', () => {
    it('should render just the inline error', () => {
      const { getAllByRole, container } = render(
        <SessionProvider>
          <CodeLine {...typeErrorProps} />
        </SessionProvider>
      );
      expect(getAllByRole('status')).toHaveLength(1);
      expect(container.querySelector('[data-title="Warning"]')).toBeVisible();
    });
  });

  describe('syntaxError prop', () => {
    it('renders the error inline', () => {
      const { container } = render(
        <SessionProvider>
          <CodeLine syntaxError={syntaxError}>10</CodeLine>
        </SessionProvider>
      );

      expect(
        container.querySelector('[data-title="Warning"]')
      ).toBeInTheDocument();
    });
  });
});
