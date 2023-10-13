import { render } from '@testing-library/react';

import { AssistantAIMessage } from './AssistantAIMessage';
import { noop } from '@decipad/utils';

it('renders like and dislike buttons in message', () => {
  const { getByTestId } = render(
    <AssistantAIMessage
      text="Hello"
      type="success"
      rating={undefined}
      canRegenerate={false}
      handleLikeResponse={noop}
      handleDislikeResponse={noop}
      handleRegenerateResponse={noop}
    />
  );
  expect(getByTestId('like-button')).toBeVisible();
  expect(getByTestId('dislike-button')).toBeVisible();
  expect(getByTestId('copy-button')).toBeVisible();
});
