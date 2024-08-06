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
  highlight?: boolean;
  fadeLines?: boolean;
}

export const StructuredInputLines = ({
  children,
  fadeLines = true,
}: StructuredInputLinesProps): ReturnType<React.FC> => {
  return (
    <div className={'block-p'} css={structuredInputContainerStyles}>
      {fadeLines && (
        <span css={fadeLineTopLeftStyles} contentEditable={false} />
      )}
      <span css={borderTopStyles} contentEditable={false} />
      {fadeLines && (
        <span css={fadeLineTopRightStyles} contentEditable={false} />
      )}

      <div css={siChildrenStyles}>{children}</div>

      {fadeLines && (
        <span css={fadeLineBotLeftStyles} contentEditable={false} />
      )}
      <span css={borderBotStyles} contentEditable={false} />
      {fadeLines && (
        <span css={fadeLineBotRightStyles} contentEditable={false} />
      )}
    </div>
  );
};
