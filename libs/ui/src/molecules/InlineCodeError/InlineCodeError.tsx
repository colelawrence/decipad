import { FC, useEffect } from 'react';
import { InferError } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { useAnalytics } from '@decipad/client-events';
import { useSession } from 'next-auth/react';
import { CodeError } from '../../atoms';
import { CodeResultProps } from '../../types';

export const InlineCodeError = ({
  type,
}: CodeResultProps<'type-error'>): ReturnType<FC> => {
  const computer = useComputer();
  const { url } = new InferError(type.errorCause);
  const message = computer.formatError(type.errorCause);
  const analytics = useAnalytics();
  const userId = (useSession()?.data?.user as { id: string }).id;

  useEffect(() => {
    analytics?.track('user code error', {
      message,
      url,
      userId,
    });
  }, [analytics, message, userId, url]);

  return <CodeError message={message} url={url} />;
};
