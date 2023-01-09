import { FC, useEffect, useContext } from 'react';
import { InferError } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { ClientEventsContext } from '@decipad/client-events';
import { AnyElement } from '@decipad/editor-types';
import { CodeError } from '../../atoms';
import { CodeResultProps } from '../../types';

type InlineCodeErrorProps = CodeResultProps<'type-error'> & {
  element?: AnyElement;
};

export const InlineCodeError: FC<InlineCodeErrorProps> = ({
  type,
  element,
}) => {
  const computer = useComputer();
  const { url } = new InferError(type.errorCause);
  const message = computer.formatError(type.errorCause);
  const clientEvent = useContext(ClientEventsContext);

  useEffect(() => {
    clientEvent({
      type: 'action',
      action: 'user code error',
      props: {
        errorType: type.errorCause.errType,
        elementType: element?.type,
        message,
        url,
      },
    });
  }, [clientEvent, element?.type, message, type.errorCause.errType, url]);

  return <CodeError message={message} url={url} />;
};
