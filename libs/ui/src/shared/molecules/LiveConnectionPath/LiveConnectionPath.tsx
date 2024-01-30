/* eslint decipad/css-prop-named-variable: 0 */
import { FC, PropsWithChildren } from 'react';
import { Label } from '../../atoms';

export const LiveConnectionPath: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      css={{
        display: 'grid',
      }}
    >
      <Label renderContent={() => children}>
        <span>Path:</span>
      </Label>
    </div>
  );
};
