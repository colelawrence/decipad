import { css } from '@emotion/react';
import { FC } from 'react';
import { TextAndIconButton } from '../../atoms';
import { Chevron } from '../../icons';

const showMoreButtonWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
});

interface ToggleCollapsedProps {
  readonly setCollapsed: (collapsed: boolean) => void;
  readonly isCollapsed?: boolean;
}

export const ToggleCollapsed: FC<ToggleCollapsedProps> = ({
  isCollapsed,
  setCollapsed,
}) => {
  const handleClick = () => {
    setCollapsed(!isCollapsed);
  };

  return (
    <div css={showMoreButtonWrapperStyles} contentEditable={false}>
      <TextAndIconButton
        text={isCollapsed ? 'Show Table' : 'Hide Table'}
        onClick={handleClick}
        iconPosition="left"
      >
        <Chevron type={isCollapsed ? 'expand' : 'collapse'} />
      </TextAndIconButton>
    </div>
  );
};
