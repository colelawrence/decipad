import { FC } from 'react';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';
import { Spinner } from '../Spinner/Spinner';

export const PendingResult: FC<CodeResultProps<'pending'>> = () => {
  const trigger = <Spinner />;

  return <Tooltip trigger={trigger}>Loading...</Tooltip>;
};
