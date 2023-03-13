import { FC } from 'react';
import { css } from '@emotion/react';
import { cssVar, smallCode, p12Medium, p12Regular } from '../../primitives';

const explanationTextStyles = css({
  lineHeight: '16px',
  padding: '4px',
  fontSize: '8pt',
  color: cssVar('weakTextColor'),
  code: css(smallCode, {
    display: 'block',
    borderRadius: '3px',
    padding: '0.25rem',
    backgroundColor: cssVar('tooltipCodeBackground'),
    color: cssVar('weakTextColor'),
  }),
});

const titleTextStyles = css(p12Medium);

const maxSpace = css({
  maxHeight: '200px',
  overflowY: 'auto',
});

const FormulaTooltipBoxStyles = css(p12Regular, {
  width: '220px',
  backgroundColor: cssVar('notebookStateDisabledLight'),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  margin: '3px 3px 3px 0px',
  borderRadius: '8px',
  padding: '4px 0px 0px 2px',
  color: cssVar('normalTextColor'),
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
          <span>
            <span css={[explanationTextStyles, titleTextStyles, maxSpace]}>
              {formulaGroup}
            </span>
          </span>
        )}
        {explanation && (
          <span css={[explanationTextStyles, maxSpace]}>{explanation}</span>
        )}
        {syntax && (
          <span css={[explanationTextStyles, maxSpace]}>
            <code>{syntax}</code>
          </span>
        )}
        {example && (
          <span>
            <span css={[explanationTextStyles, maxSpace]}>Example</span>
            <p css={[explanationTextStyles, maxSpace]}>
              <code>{example} </code>
            </p>
          </span>
        )}
      </div>
    </div>
  );
};
