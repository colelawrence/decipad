import { ReactNode, useState } from 'react';
import * as Styled from './styles';
import { Chat } from 'libs/ui/src/icons';

type BlockCommentButtonProps = {
  readonly children: ReactNode;
  readonly canComment: boolean;
  readonly onComment: () => void;
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

export const BlockCommentButton: React.FC<BlockCommentButtonProps> = ({
  children,
  canComment,
  onComment,
}) => {
  const [hovering, setHovering] = useState(false);

  if (!canComment) {
    return <>{children}</>;
  }
  return (
    <Styled.Wrapper
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Styled.Button
        onClick={onComment}
        variants={variants}
        transition={{ duration: 0.15 }}
        animate={hovering ? 'show' : 'hide'}
      >
        <Chat />
      </Styled.Button>
      {children}
    </Styled.Wrapper>
  );
};
