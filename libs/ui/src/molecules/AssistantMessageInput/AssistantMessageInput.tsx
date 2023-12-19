import { useContext, useEffect, useRef, useState } from 'react';

import { Send, Stop } from '../../icons';
import { css } from '@emotion/react';
import { componentCssVars, cssVar, p13Bold, p14Medium } from '../../primitives';
import { ClientEventsContext } from '@decipad/client-events';

const wrapperStyles = css({
  position: 'relative',
});

export const containerStyles = (isFirstInteraction: boolean) =>
  css({
    position: 'relative',
    display: 'flex',
    minHeight: 40,
    width: '100%',
    border: `1px solid ${
      isFirstInteraction
        ? componentCssVars('AIAssistantHighlightColor')
        : cssVar('borderDefault')
    }`,
    borderRadius: 8,
    alignItems: 'center',
    padding: '9px 12px 7px 16px',

    // :has seems to have enough browser support to use
    '&:has(textarea:focus)': {
      borderColor: isFirstInteraction
        ? componentCssVars('AIAssistantHighlightColor')
        : componentCssVars('AIAssistantBorderColor'),

      boxShadow: isFirstInteraction
        ? `0 0 0 1px ${componentCssVars('AIAssistantHighlightColor')}`
        : `0 0 0 3px ${cssVar('borderDefault')}`,
    },

    '&:has(textarea:not(:placeholder-shown))': {
      borderColor: isFirstInteraction
        ? componentCssVars('AIAssistantHighlightColor')
        : componentCssVars('AIAssistantBorderColor'),
    },
  });

export const borderContainerStyles = css({
  position: 'absolute',
  zIndex: 0,
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  borderRadius: 8,
  animation: 'pulse 2s infinite',

  '@keyframes pulse': {
    '0%': {
      opacity: 0.6,
      boxShadow: `0 0 0 0px ${componentCssVars('AIAssistantHighlightColor')}`,
    },
    '100%': {
      opacity: 0,
      boxShadow: `0 0 0 12px ${componentCssVars('AIAssistantHighlightColor')}`,
    },
  },
});

const inputStyles = css(p14Medium, {
  width: '100%',
  height: '100%',
  zIndex: 1,
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
  position: 'absolute',
  zIndex: 2,
  top: 8,
  right: 8,
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
  color: componentCssVars('AIAssistantBorderColor'),

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
  readonly isFirstInteraction: boolean;
  readonly reachedCreditLimit: boolean;
};

export const AssistantMessageInput: React.FC<AssistantMessageInputProps> = ({
  isGenerating,
  onStop,
  onSubmit,
  isFirstInteraction,
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = !isGenerating && value.trim() === '';

  const clientEvent = useContext(ClientEventsContext);

  const resetInput = () => {
    setValue('');
  };

  useEffect(() => {
    handleTextAreaChange();
  }, [value]);

  const handleSubmit = () => {
    onSubmit(value);
    clientEvent({
      type: 'action',
      action: 'ai chat send message',
      props: {
        isSuggested: false,
      },
    });
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
      <div css={containerStyles(isFirstInteraction)}>
        <div css={borderContainerStyles} hidden={!isFirstInteraction} />
        <textarea
          data-testid="message-input"
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          rows={1}
          css={inputStyles}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={
            isFirstInteraction
              ? 'Get started with Decipad AI Assistant...'
              : 'Type your message here...'
          }
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
