import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { InlineColumnResult } from './InlineColumnResult';

it('renders value', async () => {
  const { container } = render(
    <InlineColumnResult {...await runCode('[10, 20, 30]')} />
  );

  expect(container.textContent).toBe('10, 20, 30');
});
