import { FC, useEffect, useContext } from 'react';
import { InferError } from '@decipad/remote-computer';
import { ClientEventsContext } from '@decipad/client-events';
import { AnyElement } from '@decipad/editor-types';
import { CodeError } from '../CodeError/CodeError';
import { CodeResultProps } from '../../../types';
import { formatError } from '@decipad/format';

export type InlineCodeErrorProps = CodeResultProps<'type-error'> & {
  element?: AnyElement;
};

export const InlineCodeError: FC<InlineCodeErrorProps> = ({
  type,
  element,
}) => {
  const { url } = new InferError(type.errorCause);
  const message = formatError('en-US', type.errorCause);
  const clientEvent = useContext(ClientEventsContext);

  useEffect(() => {
    clientEvent({
      segmentEvent: {
        type: 'action',
        action: 'user code error',
        props: {
          errorType: type.errorCause.errType,
          elementType: element?.type,
          message,
          url,
        },
      },
    });
  }, [clientEvent, element?.type, message, type.errorCause.errType, url]);

  return <CodeError message={message} url={url} />;
};
