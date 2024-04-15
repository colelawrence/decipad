/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { Formula } from '../../../icons';
import {
  componentCssVars,
  cssVar,
  p12Medium,
  p12Regular,
  p13Bold,
} from '../../../primitives';

const explanationTextStyles = css(p12Medium, {
  padding: '4px 2px',
  color: cssVar('textDisabled'),
  code: css({
    display: 'block',
    height: '100%',
    borderRadius: '3px',
    padding: '1px 2px',
    backgroundColor: componentCssVars('TooltipCodeBackground'),
    color: cssVar('textSubdued'),
  }),
});

const iconStyles = css({
  width: '16px',
  height: '16px',
  display: 'grid',
  borderRadius: '6px',
  marginLeft: '3px',
});

const titleTextStyles = css(p13Bold, {
  color: cssVar('textSubdued'),
});

const sectionStyles = css({
  marginTop: '5px',
  paddingLeft: '1px',
});

const maxSpace = css({
  maxHeight: '200px',
  overflowY: 'hidden',
});

const FormulaTooltipBoxStyles = css(p12Regular, {
  width: '235px',
  backgroundColor: cssVar('backgroundDefault'),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  margin: '3px 3px 3px 0px',
  borderRadius: '8px',
  padding: '2px 2px 0px 3px',
  color: cssVar('textDefault'),
});

const FormulaTooltipContentStyles = css({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '163px',
  userSelect: 'text',
});

interface AutoCompleteMenuFormulaTooltipProps {
  readonly explanation?: string;
  readonly syntax?: string;
  readonly example?: string;
  readonly formulaGroup?: string;
}

export const AutoCompleteMenuFormulaTooltip = ({
  explanation,
  syntax,
  example,
  formulaGroup,
}: AutoCompleteMenuFormulaTooltipProps): ReturnType<FC> => {
  return (
    <div css={FormulaTooltipContentStyles}>
      <div css={FormulaTooltipBoxStyles}>
        {formulaGroup && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span css={iconStyles}>
              <Formula />
            </span>
            <span css={[explanationTextStyles, titleTextStyles, maxSpace]}>
              Function for {formulaGroup}
            </span>
          </span>
        )}
        <span css={sectionStyles}>
          {explanation && (
            <span css={[explanationTextStyles, maxSpace]}>{explanation}</span>
          )}
          {syntax && (
            <p css={[explanationTextStyles]}>
              <code>{syntax}</code>
            </p>
          )}
        </span>
        {example && (
          <span css={sectionStyles}>
            <span css={[explanationTextStyles, maxSpace]}>Example</span>
            <p css={[explanationTextStyles]}>
              <code>{example} </code>
            </p>
          </span>
        )}
      </div>
    </div>
  );
};
