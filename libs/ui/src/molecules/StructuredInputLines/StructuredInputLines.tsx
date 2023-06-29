/* eslint decipad/css-prop-named-variable: 0 */
import {
  useEditorStylesContext,
  useThemeFromStore,
} from '@decipad/react-contexts';
import { ReactNode } from 'react';
import { AvailableSwatchColor } from '../../utils';
import { bubbleColors } from '../../utils/bubbleColors';
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
  const { color } = useEditorStylesContext();
  const [isDarkTheme] = useThemeFromStore();
  const { backgroundColor, textColor } = bubbleColors({
    color: color as AvailableSwatchColor,
    isDarkTheme,
    variant: highlight ? 'highlighted' : 'normal',
  });
  return (
    <div
      css={[
        structuredInputContainerStyles,
        {
          'code .codevardef': {
            backgroundColor: backgroundColor.hex,
            color: textColor.hex,
          },
        },
      ]}
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
