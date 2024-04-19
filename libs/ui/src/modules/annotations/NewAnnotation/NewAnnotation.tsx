import { useCreateAnnotationMutation } from '@decipad/graphql-client';
import { useToast } from '@decipad/toast';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Styled from './styles';
import { Send } from 'libs/ui/src/icons';

type NewAnnotationProps = {
  blockId: string;
  notebookId: string;
  closeAnnotation: () => void;
  scenarioId: string | null;
  isReply: boolean;
};

export const NewAnnotation: React.FC<NewAnnotationProps> = ({
  blockId,
  notebookId,
  closeAnnotation,
  isReply,
}) => {
  const toast = useToast();
  const [annotation, setAnnotation] = useState<string>('');
  const [, createAnnotation] = useCreateAnnotationMutation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleTextAreaChange = () => {
    const textarea = inputRef.current;

    if (textarea === null) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    handleTextAreaChange();
  }, [annotation]);

  const isDisabled = useMemo(() => {
    return status === 'loading' || annotation.length === 0;
  }, [status, annotation]);

  const handleSubmit = useCallback(async () => {
    if (isDisabled) {
      return;
    }
    setStatus('idle');
    setAnnotation('');

    const res = await createAnnotation({
      content: annotation,
      blockId,
      padId: notebookId,
    });
    if (res.error) {
      toast.error('Error creating annotation');
      setStatus('error');
      return;
    }

    closeAnnotation();
  }, [
    createAnnotation,
    annotation,
    blockId,
    notebookId,
    toast,
    isDisabled,
    closeAnnotation,
  ]);

  const handleForm = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      await handleSubmit();
    },
    [handleSubmit]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();

        handleSubmit();
      }
      if (event.key === 'Esc') {
        event.preventDefault();

        setAnnotation('');
        closeAnnotation();
      }
    },
    [handleSubmit, closeAnnotation]
  );

  return (
    <Styled.Wrapper extendedView={isReply} onSubmit={handleForm}>
      <Styled.Textarea
        disabled={status === 'loading'}
        ref={inputRef}
        value={annotation}
        autoFocus
        rows={1}
        placeholder={isReply ? 'Add a reply' : 'Add a comment'}
        onKeyDown={handleKeyDown}
        onChange={(e) => setAnnotation(e.target.value)}
      />

      <Styled.SubmitButton type="submit" disabled={isDisabled}>
        <Send />
      </Styled.SubmitButton>
    </Styled.Wrapper>
  );
};
