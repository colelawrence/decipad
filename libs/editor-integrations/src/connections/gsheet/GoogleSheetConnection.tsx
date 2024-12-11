import { FC } from 'react';
import { ConnectionProps } from '../types';
import { OAuthConnections } from '../shared';
import { FromUrl } from './FromUrl';

export const GoogleSheetConnection: FC<ConnectionProps> = (props) => (
  // <UIGoogleSheetConnection>
  <>
    <OAuthConnections
      {...props}
      label="Select or connect account (optional)"
      placeholder="Anonymous"
      provider="gsheets"
    />
    <FromUrl {...props} />
  </>
  // </UIGoogleSheetConnection>
);
