import { render } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

it('renders children', async () => {
  const { getByText } = render(
    <CodeBlock>
      <span>Code</span>
    </CodeBlock>
  );

  expect(getByText('Code')).toBeVisible();
});
