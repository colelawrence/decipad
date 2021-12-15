import { render } from '@testing-library/react';
import { runCode } from '@decipad/language';

import { TableResult } from './TableResult';

const code = 'my_table = { H1 = [1, 2], H2 = ["A", "B"]}';

describe('variant prop', () => {
  it('renders a table by default', async () => {
    const { getAllByRole } = render(<TableResult {...await runCode(code)} />);

    const headers = getAllByRole('columnheader');
    const cells = getAllByRole('cell');
    expect(headers).toHaveLength(2);
    expect(cells).toHaveLength(4);
    [...headers, ...cells].forEach((element) => expect(element).toBeVisible());
  });
});
