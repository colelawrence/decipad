/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';

import { ImportElementSource } from '@decipad/editor-types';
import { InlineMenuItem } from '../editor/InlineMenuItem/InlineMenuItem';

interface SelectIntegrationProps {
  integrations: Array<{
    type: ImportElementSource;
    icon: ReactNode;
    title: string;
    description: string;
    enabled: boolean;
  }>;
  onSelectIntegration: (connectionType: ImportElementSource) => void;
}

export const SelectIntegration: FC<SelectIntegrationProps> = ({
  integrations,
  onSelectIntegration,
}) => (
  <div css={mainStyles}>
    {integrations.map((i) => {
      return (
        <InlineMenuItem
          key={i.title}
          title={i.title}
          description={i.description}
          icon={i.icon}
          enabled={i.enabled}
          onExecute={() => onSelectIntegration(i.type)}
          testId={`select-integration:${i.title}`}
        />
      );
    })}
  </div>
);
const mainStyles = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px 0',
  padding: '8px',
});
