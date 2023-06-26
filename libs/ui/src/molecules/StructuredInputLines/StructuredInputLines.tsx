/* eslint decipad/css-prop-named-variable: 0 */
import { ReactNode } from 'react';
import { mutedCodeblockStyles } from '../../styles/code-block';
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
}

export const StructuredInputLines = ({
  children,
  highlight = false,
}: StructuredInputLinesProps): ReturnType<React.FC> => {
  return (
    <div
      css={[structuredInputContainerStyles, !highlight && mutedCodeblockStyles]}
    >
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
