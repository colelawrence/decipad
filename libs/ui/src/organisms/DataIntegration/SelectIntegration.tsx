/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p13Bold, p13Regular } from '../../primitives';
import { soonStyles } from '../../styles/menu';

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
      const disabled = !i.enabled;
      return (
        <button
          type="button"
          key={i.title}
          css={[childrenStyles, disabled && disabledStylez]}
          onClick={i.onClick}
          data-testid={`select-integration:${i.title}`}
        >
          <div>{i.icon}</div>

          <span
            css={[
              p13Bold,
              {
                flexBasis: '125px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              },
            ]}
          >
            {i.title} {disabled && <span css={soonStyles}>SOON</span>}
          </span>
          <span css={p13Regular}>{i.description}</span>
        </button>
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

const childrenStyles = css({
  width: '100%',
  height: '42px',
  borderRadius: '8px',
  backgroundColor: cssVar('backgroundDefault'),
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  padding: '12px 16px',
  cursor: 'pointer',

  img: {
    objectFit: 'contain',
  },

  div: {
    width: '18px',
    maxWidth: '18px',
    display: 'grid',
    alignItems: 'center',
  },

  span: {
    color: cssVar('textDefault'),
  },

  ':hover': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

const disabledStylez = {
  color: cssVar('textSubdued'),
  span: {
    color: cssVar('textDisabled'),
  },
  img: {
    filter: 'grayscale(100%)',
  },
  ':hover': {
    backgroundColor: cssVar('backgroundDefault'),
  },
};
