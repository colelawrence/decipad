/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { IntegrationDisabledItem, IntegrationItem } from './IntegrationStyles';

interface SelectIntegrationProps {
  integrations: Array<{
    icon: ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    enabled?: boolean;
  }>;
}

export const SelectIntegration: FC<SelectIntegrationProps> = ({
  integrations,
}) => (
  <div css={mainStyles}>
    {integrations.map((i) => {
      const Component = i.enabled ? IntegrationItem : IntegrationDisabledItem;

      return (
        <Component
          key={i.title}
          title={i.title}
          description={i.description}
          icon={i.icon}
          onClick={i.onClick}
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
  gap: '12px',
});
