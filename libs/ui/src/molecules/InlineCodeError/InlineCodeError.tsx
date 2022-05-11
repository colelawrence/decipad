import { FC } from 'react';
import { InferError } from '@decipad/computer';
import { CodeError } from '../../atoms';
import { CodeResultProps } from '../../types';

export const InlineCodeError = ({
  type,
}: CodeResultProps<'type-error'>): ReturnType<FC> => {
  const { message, url } = new InferError(type.errorCause);
  return <CodeError message={message} url={url} />;
};
