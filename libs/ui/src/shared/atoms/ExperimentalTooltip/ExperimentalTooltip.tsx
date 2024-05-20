import {
  ComponentProps,
  RefObject,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Button } from '../Button/Button';
import { Tooltip } from '../Tooltip/Tooltip';

import * as Styled from './styles';
import { useSession } from 'next-auth/react';
import { useActiveElement } from '@decipad/react-utils';
import { useToast } from '@decipad/toast';

type ExperimentalTooltipProps = ComponentProps<typeof Tooltip> & {
  title: string;
};

export const ExperimentalTooltip: React.FC<ExperimentalTooltipProps> = (
  props
) => {
  const { title, ...rest } = props;

  const { data: session } = useSession();
  const user = session?.user;

  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const formRef = useActiveElement(() => {
    setOpen(false);
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toast = useToast();

  const submitFeedback = useCallback(
    async (message: string) => {
      const body = {
        email: user?.email ?? 'no email',
        message,
        feature: title,
      };

      const response = await fetch(`/api/feature/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status !== 200) {
        const err = await response.json();

        console.error(err);

        toast.error('Unable to send feedback');
      }
    },
    [user, title, toast]
  );

  const resetMessage = useCallback(() => {
    setFeedback('');
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (feedback.trim() === '') return;

      submitFeedback(feedback);
      resetMessage();
      setOpen(false);
    },
    [feedback, submitFeedback, resetMessage]
  );

  const handleEnterKey = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      event.stopPropagation();
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event as any);
      }
    },
    [handleSubmit]
  );

  return (
    <Tooltip {...rest} usePortal={true}>
      <Styled.Content>
        <Styled.Title>{title} (Experimental)</Styled.Title>
        <Styled.Body>
          We're still working on this feature, but we'd like to hear your
          feedback. Be the first to try and tell us your thoughts!
        </Styled.Body>
        {open ? (
          <Styled.Form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            ref={formRef as unknown as RefObject<HTMLFormElement>}
          >
            <Styled.Textarea
              ref={textareaRef}
              onKeyDown={handleEnterKey}
              onClick={(e) => e.stopPropagation()}
              // this is needed to prevent a very odd
              onMouseMove={(e) => {
                e.stopPropagation();
                textareaRef.current?.focus();
              }}
              placeholder="Type your feedback here..."
              rows={3}
              id="message"
              name="message"
              value={feedback}
              autoFocus
              onChange={(event) => setFeedback(event.target.value)}
            />

            <Button submit disabled={feedback.trim() === ''}>
              Submit
            </Button>
          </Styled.Form>
        ) : (
          <Button onClick={() => setOpen(true)}>Leave feedback</Button>
        )}
      </Styled.Content>
    </Tooltip>
  );
};
