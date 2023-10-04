import { render } from '@testing-library/react';

import { AssistantAIMessage } from './AssistantAIMessage';
import { noop } from '@decipad/utils';

it('renders like and dislike buttons in message', () => {
  const { getByTestId } = render(
    <AssistantAIMessage
      text="Hello"
      handleLikeResponse={noop}
      handleDislikeResponse={noop}
      handleRegenerateResponse={noop}
      handleSuggestChanges={noop}
    />
  );
  expect(getByTestId('like-button')).toBeVisible();
  expect(getByTestId('dislike-button')).toBeVisible();
});
