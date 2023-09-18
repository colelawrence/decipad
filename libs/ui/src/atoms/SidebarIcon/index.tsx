import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { p12Medium } from '../../primitives';

interface SidebarIconProps {
  readonly icon: ReactNode;
  readonly description?: string;
}

export const SidebarIcon: FC<SidebarIconProps> = ({ icon, description }) => {
  return (
    <div css={sidebarIconWrapperStyles}>
      <div>{icon}</div>
      {description && (
        <div css={sidebarIconDescriptionStyles}>{description}</div>
      )}
    </div>
  );
};

const sidebarIconDescriptionStyles = css(p12Medium, {
  color: 'inherit',
  textTransform: 'capitalize',
  textAlign: 'center',
  lineHeight: '1.25',
  userSelect: 'none',
  marginBottom: '1px',
});

const sidebarIconWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1px 0',
  gap: '2px',
  flexShrink: 0,
  '& svg': {
    width: '24px',
    height: '24px',
    stroke: 'currentColor',
  },
});
