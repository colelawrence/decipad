import { render } from '@testing-library/react';
import { runCode } from '../../test-utils/language';
import { InlineCodeResult } from './InlineCodeResult';

const sum = '9 + 1';

it('renders the inline result of a statement', async () => {
  const { getByText } = render(<InlineCodeResult {...await runCode(sum)} />);

  expect(getByText('10')).toBeVisible();
});
