import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { KeyboardKey } from '..';
import { cssVar } from '../../primitives';

type ParagraphFormulaEditorProps = {
  readonly formula: ReactNode;
  readonly units?: ReactNode;
  readonly type?: 'formula' | 'input';
  readonly varName?: ReactNode;
  readonly disabled?: boolean;
};

export const ParagraphFormulaEditor = ({
  formula,
  varName,
  units,
  disabled = false,
}: ParagraphFormulaEditorProps) => {
  return (
    <>
      <div css={pParaEditStyles} data-testid={'inline-formula-editor'}>
        <span
          css={[
            pFormulaEditStyles,
            disabled && {
              backgroundColor: cssVar('strongerHighlightColor'),
              cursor: 'not-allowed',
            },
          ]}
        >
          {formula || 'tbd'}
        </span>
        {units && <span css={pUnitsStyle}>{units}</span>}
      </div>
      <div css={instructionsStyle}>
        <div css={{ width: '150px', cursor: 'default' }}>{varName}</div>
        <div>
          <KeyboardKey>ESC</KeyboardKey> or <KeyboardKey>ENTER</KeyboardKey> to
          dismiss
        </div>
      </div>
    </>
  );
};

const pUnitsStyle = css({
  boxSizing: 'border-box',
  maxHeight: '40px',
  height: '40px',
  color: cssVar('currentTextColor'),
  background: cssVar('formulaUnitBackground'),
  paddingRight: 4,
  border: `1px solid ${cssVar('strongerHighlightColor')}`,
  borderRadius: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  '>span': {
    padding: '10px 0 10px 2px',
  },
});

const pParaEditStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  minWidth: 350,
  span: {
    maxWidth: 350,
  },
});
const pFormulaEditStyles = css({
  boxSizing: 'border-box',
  flexDirection: 'row',
  padding: '6px 12px',
  minHeight: '40px',
  background: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongerHighlightColor')}`,
  borderRadius: '6px',
  flex: 'none',
  order: 0,
  flexGrow: 1,
});
const instructionsStyle = css({
  minHeight: '36px',
  fontSize: '12px',
  fontWeight: 500,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '4px 0',
});
