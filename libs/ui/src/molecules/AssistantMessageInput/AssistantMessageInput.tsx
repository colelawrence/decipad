import { useState } from 'react';

import { Send } from '../../icons';
import { css } from '@emotion/react';
import { p14Regular } from '@decipad/ui';
import { componentCssVars } from '../../primitives';

const wrapperStyles = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 44,
  backgroundColor: componentCssVars('AIAssistantElevationColor'),
});

const inputStyles = css(p14Regular, {
  width: '100%',
  height: '100%',
  lineHeight: '20px',
  padding: '0px 24px',
  border: 'none',
  outline: 'none',
  backgroundColor: componentCssVars('AIAssistantElevationColor'),
  color: componentCssVars('AIAssistantTextColor'),

  '&::placeholder': {
    color: componentCssVars('AIAssistantTextSubduedColor'),
  },
});

const submitButtonStyles = css({
  position: 'absolute',
  right: 12,
  height: 24,
  width: 24,
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: componentCssVars('AIAssistantHighlightColor'),
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  color: componentCssVars('AIAssistantTextColor'),

  '& svg': {
    width: 16,
    height: 16,

    '& path': {
      stroke: componentCssVars('AIAssistantTextColor'),
    },
  },
});

/* eslint decipad/css-prop-named-variable: 0 */
type AssistantMessageInputProps = {
  readonly onSubmit: (text: string) => void;
};

export const AssistantMessageInput: React.FC<AssistantMessageInputProps> = ({
  onSubmit,
}) => {
  const [value, setValue] = useState('');

  const resetInput = () => {
    setValue('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value === '') {
      return;
    }
    onSubmit(value);
    resetInput();
  };

  return (
    <form css={wrapperStyles} onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        css={inputStyles}
        placeholder="What can I do for you?"
      />
      <button type="submit" disabled={value === ''} css={submitButtonStyles}>
        <Send />
      </button>
    </form>
  );
};
