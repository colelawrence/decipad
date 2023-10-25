import React, { useCallback, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cssVar, grey500, p13Medium, transparency } from '../../primitives';
import { css } from '@emotion/react';
import { Button } from '../../atoms';

const shadow1 = transparency(grey500, 0.02).rgba;
const shadow2 = transparency(grey500, 0.08).rgba;

const wrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  padding: '6px',
  backgroundColor: cssVar('backgroundMain'),
  boxShadow: `0px 1px 2px ${shadow1}, 0px 2px 12px ${shadow2}`,
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '8px',
  minWidth: '240px',
  position: 'absolute',
  zIndex: 400,
});

const formStyles = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const inputStyles = css(p13Medium, {
  padding: '8px 12px',
  flex: '1 1 100%',
  resize: 'none',
  background: cssVar('backgroundDefault'),
  ':focus-within': {},

  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '6px',
  '*:hover > &, :focus': {
    borderColor: `${cssVar('borderSubdued')}`,
  },
});

type AssistantFeedbackPopUpProps = {
  trigger: React.ReactNode;
  onSubmit: (message: string) => void;
};

export const AssistantFeedbackPopUp: React.FC<AssistantFeedbackPopUpProps> = ({
  onSubmit,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const resetMessage = useCallback(() => {
    setMessage('');
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (message === '') return;

      onSubmit(message);
      resetMessage();
      setOpen(false);
    },
    [message, onSubmit, resetMessage]
  );

  const handleEnterKey = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event as any);
      }
    },
    [handleSubmit]
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Content sideOffset={5} css={wrapperStyles}>
        <form onSubmit={handleSubmit} css={formStyles}>
          <textarea
            css={inputStyles}
            onKeyDown={handleEnterKey}
            placeholder="Type your feedback here..."
            rows={3}
            id="message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <Button type="primary" submit disabled={message === ''}>
            Submit
          </Button>
        </form>
      </Popover.Content>
    </Popover.Root>
  );
};
