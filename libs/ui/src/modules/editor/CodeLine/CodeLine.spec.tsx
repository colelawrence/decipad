import { vi } from 'vitest';
import { act, render } from '@testing-library/react';
import createFetch from 'vitest-fetch-mock';
import { SessionProvider } from 'next-auth/react';
import { ComponentProps } from 'react';
import { runCode } from '../../../test-utils';
import { CodeLine } from './CodeLine';
import { timeout } from '@decipad/testutils';

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
      const { getByRole } = render(<CodeLine {...tabularProps} highlight />);
      // wait for the table to render
      await timeout(1000);
      expect(getByRole('table')).toBeVisible();
    });

    it('should not render the result inline', async () => {
      const { getByRole, getAllByRole, findAllByRole } = render(
        <SessionProvider>
          <CodeLine {...tabularProps} highlight />
        </SessionProvider>
      );
      // wait for the table to render
      await act(() => timeout(1000));

      const queryInlineResultElement = async () =>
        (await findAllByRole('status')).find(
          (element) => element!.textContent === '1, 2, 3'
        ) as HTMLElement;

      expect(getAllByRole('status')).toHaveLength(1);
      expect(await queryInlineResultElement()).toBe(undefined);
      expect(getByRole('table')).toBeVisible();
    });
  });

  describe('when result is an error', () => {
    it('should render just the inline error', () => {
      const { getAllByRole, queryByTitle } = render(
        <SessionProvider>
          <CodeLine {...typeErrorProps} />
        </SessionProvider>
      );
      expect(getAllByRole('status')).toHaveLength(1);
      expect(queryByTitle(/warning/i)!.closest('svg')).toBeVisible();
    });
  });

  describe('syntaxError prop', () => {
    it('renders the error inline', () => {
      const { getByTitle } = render(
        <SessionProvider>
          <CodeLine syntaxError={syntaxError}>10</CodeLine>
        </SessionProvider>
      );

      expect(getByTitle(/Warning/i).closest('svg')).toBeVisible();
    });
  });
});
