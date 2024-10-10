import { ReactNode, useState } from 'react';
import * as Styled from './styles';

export type BlockContextualActionsProps = {
  readonly children: ReactNode;
  readonly contextualActions: {
    id: string;
    icon: ReactNode;
    onClick: () => void;
  }[];
  readonly fullHeight?: boolean;
};

const variants = {
  show: {
    opacity: 1,
    scale: 1,
  },
  hide: {
    opacity: 0,
    scale: 0.8,
  },
};

export const BlockContextualActions: React.FC<BlockContextualActionsProps> = ({
  children,
  contextualActions,
  fullHeight,
}) => {
  const [hovering, setHovering] = useState(false);

  if (contextualActions.length === 0) {
    return <>{children}</>;
  }
  return (
    <Styled.BlockWrapper
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      fullHeight={fullHeight}
    >
      <Styled.ButtonsWrapper>
        {contextualActions.map(({ id, icon, onClick }) => (
          <Styled.Button
            key={id}
            onClick={onClick}
            variants={variants}
            transition={{ duration: 0.15 }}
            animate={hovering ? 'show' : 'hide'}
            data-testid={`block-action-${id}`}
          >
            {icon}
          </Styled.Button>
        ))}
      </Styled.ButtonsWrapper>
      {children}
    </Styled.BlockWrapper>
  );
};
