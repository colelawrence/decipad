import { FC } from 'react';
import { ConnectionProps } from '../types';
import { Divider, UIGoogleSheetConnection } from '@decipad/ui';
import { SheetSelector } from './Subsheets';
import { Loading, OAuthConnections } from '../shared';
import { FromUrl } from './FromUrl';

export const GoogleSheetConnection: FC<ConnectionProps> = (props) => (
  <UIGoogleSheetConnection>
    <OAuthConnections
      {...props}
      label="Select GSheet Connection"
      provider="gsheets"
    />
    <SheetSelector {...props} />
    <Divider />
    <FromUrl {...props} />
    <Loading info={props.info} />
  </UIGoogleSheetConnection>
);
