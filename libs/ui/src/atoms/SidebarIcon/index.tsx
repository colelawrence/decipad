import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p12Medium } from '../../primitives';

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
  textTransform: 'capitalize',
  color: cssVar('textHeavy'),
  textAlign: 'center',
  userSelect: 'none',
});

const sidebarIconWrapperStyles = css`
  display: flex;
  border-radius: 6px;
  width: 75px;
  padding: 4px 6px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;
