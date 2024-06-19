import type { FC } from 'react';
import { Suspense } from 'react';
import type { ConnectionProps } from '../types';
import { Styles } from './styles';
import { NotionPrivateDatabases } from './DatabaseSelector';
import { Loading, OAuthConnections } from '../shared';

export const NotionConnection: FC<ConnectionProps> = (props) => {
  return (
    <Styles.OuterWrapper>
      <Styles.Wrapper>
        <Suspense>
          <OAuthConnections
            {...props}
            label="Select Notion Connection"
            provider="notion"
          />
          <NotionPrivateDatabases {...props} />
          <Loading />
        </Suspense>
      </Styles.Wrapper>
    </Styles.OuterWrapper>
  );
};
