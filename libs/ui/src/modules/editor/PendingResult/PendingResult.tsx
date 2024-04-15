import { FC } from 'react';

import { resultLoadingIconStyles } from '../../../styles/results';
import { CodeResultProps } from '../../../types';
import { Tooltip } from '../../../shared/atoms/Tooltip/Tooltip';
import { Loading } from 'libs/ui/src/shared';

export const PendingResult: FC<CodeResultProps<'pending'>> = () => {
  const trigger = (
    <span data-testid="loading-results" css={resultLoadingIconStyles}>
      <Loading />
    </span>
  );

  return <Tooltip trigger={trigger}>Loading...</Tooltip>;
};
