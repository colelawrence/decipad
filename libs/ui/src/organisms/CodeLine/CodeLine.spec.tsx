import { render } from '@testing-library/react';
import { Result } from '@decipad/language';
import { runCode } from '../../test-utils';

import { CodeLine } from './CodeLine';

it('renders children', () => {
  const { getByText } = render(<CodeLine>10</CodeLine>);
  expect(getByText('10')).toBeVisible();
});

describe('displayInline prop', () => {
  it('does not render inline by default', async () => {
    const { queryByText } = render(
      <CodeLine result={await runCode('9 + 1')}>9 + 1</CodeLine>
    );
    expect(queryByText('10')).toBeNull();
  });

  it('renders inline result when true', async () => {
    const { getByText } = render(
      <CodeLine displayInline result={await runCode('9 + 1')}>
        9 + 1
      </CodeLine>
    );
    expect(getByText('10')).toBeVisible();
  });

  it('always renders type errors inline', async () => {
    const result: Result = {
      value: null,
      type: {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: 'Some error,',
        },
      },
    };
    const { getByTitle, rerender } = render(
      <CodeLine result={result}>9 +</CodeLine>
    );
    expect(getByTitle(/info/i).closest('svg')).toBeVisible();

    rerender(
      <CodeLine displayInline result={result}>
        9 +
      </CodeLine>
    );
    expect(getByTitle(/info/i).closest('svg')).toBeVisible();
  });
});

describe('syntaxError prop', () => {
  it('renders the error inline', () => {
    const { getByTitle } = render(
      <CodeLine syntaxError={{ message: 'Syntax Error', url: 'https://foo' }}>
        10
      </CodeLine>
    );

    expect(getByTitle(/info/i).closest('svg')).toBeVisible();
  });
});
