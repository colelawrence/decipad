import { render } from '@testing-library/react';

import { AssistantNotebookMessage } from './AssistantNotebookMessage';

it('renders text in message', () => {
  const { getByText } = render(<AssistantNotebookMessage text="Hello" />);
  expect(getByText('Hello')).toBeVisible();
});
