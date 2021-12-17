import { FC } from 'react';
import { InferError } from '@decipad/language';
import { ResultProps } from '../../lib/results';
import { CodeError } from '../../atoms';

export const InlineCodeError = ({
  type,
}: ResultProps<'type-error'>): ReturnType<FC> => {
  const { message, url } = new InferError(type.errorCause);
  return <CodeError message={message} url={url} />;
};
