import { useEffect, useRef, useState } from 'react';

import { Send, Stop } from '../../icons';
import { css } from '@emotion/react';
import { cssVar, p13Bold, p14Medium } from '../../primitives';

const wrapperStyles = css({
  position: 'relative',
});

export const containerStyles = css({
  display: 'grid',
  gridTemplateColumns: 'auto max-content',
  gap: 8,
  minHeight: 40,
  width: '100%',
  backgroundColor: cssVar('backgroundHeavy'),
  borderRadius: 8,
  alignItems: 'center',
  padding: '8px 12px 8px 16px',
});

const inputStyles = css(p14Medium, {
  width: '100%',
  height: '100%',
  lineHeight: '20px',
  padding: 0,
  margin: '2px 0px',
  border: 'none',
  outline: 'none',
  resize: 'none',
  color: cssVar('textHeavy'),
  backgroundColor: 'transparent',

  '&::placeholder': {
    color: cssVar('textSubdued'),
  },
});

const submitButtonStyles = css(p13Bold, {
  height: 24,
  minWidth: 24,
  padding: '0px 4px',
  width: 'auto',
  borderRadius: 6,
  alignSelf: 'flex-end',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  color: cssVar('textSubdued'),

  '& > span': {
    padding: '2px 4px 0px 4px',
  },

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
  },

  '&:disabled': {
    cursor: 'not-allowed',
    pointerEvents: 'none',

    '& svg': {
      color: cssVar('textDisabled'),
    },
  },

  '& svg': {
    width: 18,
    height: 18,
  },
});

/* eslint decipad/css-prop-named-variable: 0 */
type AssistantMessageInputProps = {
  readonly isGenerating: boolean;
  readonly onStop: () => void;
  readonly onSubmit: (text: string) => void;
};

export const AssistantMessageInput: React.FC<AssistantMessageInputProps> = ({
  isGenerating,
  onStop,
  onSubmit,
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = !isGenerating && value.trim() === '';

  const resetInput = () => {
    setValue('');
  };

  useEffect(() => {
    handleTextAreaChange();
  }, [value]);

  const handleSubmit = () => {
    onSubmit(value);
    resetInput();
  };

  const handleTextAreaChange = () => {
    const textarea = inputRef.current;

    if (textarea === null) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (isDisabled) {
        return;
      }

      handleSubmit();
    }
  };

  const handleForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

    handleSubmit();
  };

  return (
    <form css={wrapperStyles} onSubmit={handleForm} data-testid="message-form">
      <div css={containerStyles}>
        <textarea
          data-testid="message-input"
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          rows={1}
          css={inputStyles}
          onKeyDown={handleKeyDown}
          placeholder="What can I do for you?"
        />

        {isGenerating ? (
          <button type="button" onClick={onStop} css={submitButtonStyles}>
            <span>Stop</span>
            <Stop />
          </button>
        ) : (
          <button type="submit" disabled={isDisabled} css={submitButtonStyles}>
            <Send />
          </button>
        )}
      </div>
    </form>
  );
};
