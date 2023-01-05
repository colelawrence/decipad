import { FC, useContext, useEffect } from 'react';
import { InferError } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { ClientEventsContext } from '@decipad/client-events';
import { CodeError } from '../../atoms';
import { CodeResultProps } from '../../types';

export const InlineCodeError = ({
  type,
}: CodeResultProps<'type-error'>): ReturnType<FC> => {
  const computer = useComputer();
  const { url } = new InferError(type.errorCause);
  const message = computer.formatError(type.errorCause);
  const events = useContext(ClientEventsContext);
  useEffect(() => {
    events({
      type: 'action',
      action: 'user code error',
      props: {
        message,
        url,
      },
    });
  }, [events, message, url]);

  return <CodeError message={message} url={url} />;
};
