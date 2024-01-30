import { FC } from 'react';
import { Loading } from '../../../icons';
import { resultLoadingIconStyles } from '../../../styles/results';
import { CodeResultProps } from '../../../types';
import { Tooltip } from '../../../shared/atoms/Tooltip/Tooltip';

export const PendingResult: FC<CodeResultProps<'pending'>> = () => {
  const trigger = (
    <span data-testid="loading-results" css={resultLoadingIconStyles}>
      <Loading />
    </span>
  );

  return <Tooltip trigger={trigger}>Loading...</Tooltip>;
};
