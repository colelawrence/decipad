import { ReactNode } from 'react';
import * as Styled from './styles';

export type BlockContextualActionsProps = {
  readonly contextualActions: {
    id: string;
    icon: ReactNode;
    onClick: () => void;
  }[];
  readonly fullHeight?: boolean;
};

export const BLOCK_CONTEXTUAL_ACTIONS = 'block-contextual-actions';

export const BlockContextualActions: React.FC<BlockContextualActionsProps> = ({
  contextualActions,
  fullHeight,
}) => {
  return (
    <Styled.ContextualActionWrapper
      fullHeight={fullHeight}
      className={BLOCK_CONTEXTUAL_ACTIONS}
    >
      {contextualActions.map(({ id, icon, onClick }) => (
        <Styled.Button
          key={id}
          onClick={onClick}
          data-testid={`block-action-${id}`}
        >
          {icon}
        </Styled.Button>
      ))}
    </Styled.ContextualActionWrapper>
  );
};
