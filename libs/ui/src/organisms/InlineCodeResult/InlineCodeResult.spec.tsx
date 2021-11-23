import { render } from '@testing-library/react';
import { parseOneBlock, runCode } from '@decipad/language';

import { InlineCodeResult } from './InlineCodeResult';

const literal = '10';
const literalAssign = 'A = 10';
const sum = '9 + 1';

async function getPropsForCode(code: string) {
  const statement = parseOneBlock(code).args[0];
  const result = await runCode(code);
  return { statement, type: result.type, value: result.value };
}

it('renders nothing on invalid blocks', async () => {
  const { container } = render(
    <InlineCodeResult {...await getPropsForCode(literal)} statement={null} />
  );

  expect(container.firstChild).toBeNull();
});

it('renders nothing on literal value statements', async () => {
  const { container } = render(
    <InlineCodeResult {...await getPropsForCode(literal)} />
  );

  expect(container.firstChild).toBeNull();
});

it('renders nothing on literal value assignment statements', async () => {
  const { container } = render(
    <InlineCodeResult {...await getPropsForCode(literalAssign)} />
  );

  expect(container.firstChild).toBeNull();
});

it('renders the result of any other kind of statements', async () => {
  const { getByText } = render(
    <InlineCodeResult {...await getPropsForCode(sum)} />
  );

  expect(getByText('10')).toBeVisible();
});
