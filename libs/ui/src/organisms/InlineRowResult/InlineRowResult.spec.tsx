import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { InlineRowResult } from './InlineRowResult';

const code = `
  Table = {
    Names = ["Adam", "Eve"]
    Dates = [date(2030), date(2069)]
  }
  Table

  lookup(Table, Table.Dates == date(2030))
`;

it('renders value', async () => {
  const { container } = render(<InlineRowResult {...await runCode(code)} />);

  expect(container.textContent).toMatchInlineSnapshot(`"Adam, 2030"`);
});
