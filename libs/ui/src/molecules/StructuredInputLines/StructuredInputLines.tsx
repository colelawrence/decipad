import { ReactNode } from 'react';
import {
  borderBotStyles,
  borderTopStyles,
  fadeLineBotLeftStyles,
  fadeLineBotRightStyles,
  fadeLineTopLeftStyles,
  fadeLineTopRightStyles,
  siChildrenStyles,
  structuredInputContainerStyles,
} from './styles';

interface StructuredInputLinesProps {
  children?: ReactNode;
}

export const StructuredInputLines = ({
  children,
}: StructuredInputLinesProps): ReturnType<React.FC> => {
  return (
    <div css={structuredInputContainerStyles}>
      <span css={fadeLineTopLeftStyles} contentEditable={false}></span>
      <span css={borderTopStyles} contentEditable={false}></span>
      <span css={fadeLineTopRightStyles} contentEditable={false}></span>

      <div css={siChildrenStyles}>{children}</div>

      <span css={fadeLineBotLeftStyles} contentEditable={false}></span>
      <span css={borderBotStyles} contentEditable={false}></span>
      <span css={fadeLineBotRightStyles} contentEditable={false}></span>
    </div>
  );
};
