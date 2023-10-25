import { render } from '@testing-library/react';

import { AssistantAIMessage } from './AssistantAIMessage';

it('renders copy button in message', () => {
  const { getByTestId } = render(
    <AssistantAIMessage text="Hello" status="success" />
  );
  expect(getByTestId('copy-button')).toBeVisible();
});
