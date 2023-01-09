import { ReactNode } from 'react';
import {
  borderBotStyles,
  borderTopStyles,
  fadeLineBotLeftStyles,
  fadeLineBotRightStyles,
  fadeLineTopLeftStyles,
  fadeLineTopRightStyles,
  structuredInputContainerStyles,
  childrenStyles,
} from './styles';

interface StructuredInputLinesProps {
  hasNextSibling?: boolean;
  children?: ReactNode;
}

export const StructuredInputLines = ({
  hasNextSibling,
  children,
}: StructuredInputLinesProps): ReturnType<React.FC> => {
  return (
    <div css={structuredInputContainerStyles}>
      <span css={fadeLineTopLeftStyles}></span>
      <span css={borderTopStyles}></span>
      <span css={fadeLineTopRightStyles}></span>

      <div css={childrenStyles}>{children}</div>

      {!hasNextSibling && (
        <>
          <span css={fadeLineBotLeftStyles}></span>
          <span css={borderBotStyles}></span>
          <span css={fadeLineBotRightStyles}></span>
        </>
      )}
    </div>
  );
};
