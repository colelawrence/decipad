/* eslint decipad/css-prop-named-variable: 0 */
import { FC } from 'react';
import { Loading } from '../../atoms';

export const LoadingIndicator: FC = () => {
  return (
    <div
      css={{
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div css={{ width: 'min(100%, 60px)', height: 'min(100%, 60px)' }}>
        <Loading />
      </div>
    </div>
  );
};
