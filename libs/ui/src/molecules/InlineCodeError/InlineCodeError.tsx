import { FC } from 'react';
import { InferError } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { CodeError } from '../../atoms';
import { CodeResultProps } from '../../types';

export const InlineCodeError = ({
  type,
}: CodeResultProps<'type-error'>): ReturnType<FC> => {
  const computer = useComputer();
  const { url } = new InferError(type.errorCause);
  const message = computer.formatError(type.errorCause);
  return <CodeError message={message} url={url} />;
};
