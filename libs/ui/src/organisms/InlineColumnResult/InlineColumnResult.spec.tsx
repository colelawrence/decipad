import { render } from '@testing-library/react';
import { Type } from '@decipad/language';

import { InlineColumnResult } from './InlineColumnResult';

it('renders value', () => {
  const { container } = render(
    <InlineColumnResult
      value={[10, 20, 30]}
      type={{ columnSize: 3, cellType: { type: 'number' } } as Type}
    />
  );

  expect(container.textContent).toBe('10, 20, 30');
});
