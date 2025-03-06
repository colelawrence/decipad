import { FC } from 'react';

import { ActiveDataLake, ActiveDataLakeProps } from './ActiveDataLake';
import { p8Regular } from '../../../primitives';
import { LoadingIndicator } from '../../../shared/templates/LoadingIndicator/LoadingIndicator';

export interface DataLakeProps extends ActiveDataLakeProps {}

export const DataLake: FC<ActiveDataLakeProps> = (props) => {
  if (props.dataLake.state === 'ready') {
    return <ActiveDataLake {...props} />;
  }
  if (props.dataLake.state === 'pending') {
    return <LoadingIndicator />;
  }
  return (
    <p css={p8Regular}>
      Your data lake is inactive. Please contact support if you need to activate
      it.
    </p>
  );
};
