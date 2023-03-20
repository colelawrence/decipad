import { FC } from 'react';
import { css } from '@emotion/react';
import { cssVar, p13Bold, p12Regular, p12Medium } from '../../primitives';
import { Formula } from '../../icons';

const explanationTextStyles = css(p12Medium, {
  padding: '4px 2px',
  color: cssVar('weakerTextColor'),
  code: css({
    display: 'block',
    height: '100%',
    borderRadius: '3px',
    padding: '1px 2px',
    backgroundColor: cssVar('tooltipCodeBackground'),
    color: cssVar('weakTextColor'),
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
  color: cssVar('weakTextColor'),
});

const sectionStyles = css({
  marginTop: '5px',
  paddingLeft: '1px',
});

const maxSpace = css({
  maxHeight: '200px',
  overflowY: 'auto',
});

const FormulaTooltipBoxStyles = css(p12Regular, {
  width: '235px',
  backgroundColor: cssVar('notebookStateDisabledLight'),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  margin: '3px 3px 3px 0px',
  borderRadius: '8px',
  padding: '2px 2px 0px 3px',
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
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span css={iconStyles}>
              <Formula strokeColor={cssVar('weakTextColor')} />
            </span>
            <span css={[explanationTextStyles, titleTextStyles, maxSpace]}>
              Formula for {formulaGroup}
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
