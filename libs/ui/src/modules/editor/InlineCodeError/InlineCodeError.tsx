import { FC, useEffect } from 'react';
import { InferError } from '@decipad/remote-computer';
import { analytics } from '@decipad/client-events';
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
  useEffect(() => {
    analytics.track({
      type: 'action',
      action: 'user code error',
      props: {
        errorType: type.errorCause.errType,
        elementType: element?.type,
        message,
        url,
      },
    });
  }, [element?.type, message, type.errorCause.errType, url]);

  return <CodeError message={message} url={url} />;
};
