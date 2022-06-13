import { FC } from 'react';
import { Loading } from '../../icons';

export const LoadingIndicator: FC = () => {
  return (
    <div css={{ placeSelf: 'stretch', display: 'grid', placeItems: 'center' }}>
      <div css={{ width: 'min(100%, 60px)', height: 'min(100%, 60px)' }}>
        <Loading />
      </div>
    </div>
  );
};
