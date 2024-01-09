import { CircularArrow, CurvedArrow } from '../../icons';
import { p12Bold } from '../../primitives';
import * as Styled from './styles';

interface UndoButtonsProps {
  readonly isEmbed: boolean;

  readonly canUndo: boolean;
  readonly canRedo: boolean;

  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onRevertChanges: () => void;
}

export const UndoButtons: React.FC<UndoButtonsProps> = ({
  isEmbed,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRevertChanges,
}) => (
  <Styled.ActionButtons>
    <div>
      <button type="button" onClick={onUndo} disabled={!canUndo}>
        <CurvedArrow direction="left" active={canUndo} />
      </button>
      <button type="button" onClick={onRedo} disabled={!canRedo}>
        <CurvedArrow direction="right" active={canRedo} />
      </button>
    </div>
    {isEmbed && (
      <button type="button" onClick={onRevertChanges}>
        <CircularArrow />
        <span css={p12Bold}>Clear Changes</span>
      </button>
    )}
  </Styled.ActionButtons>
);
