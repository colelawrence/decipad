import { css } from '@emotion/react';
import { cssVar } from '../../primitives';

const hotKeyStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',

  boxSizing: 'border-box',
  height: '24px',
  width: '24px',
  borderRadius: '6px',
  border: `1px ${cssVar('strongerHighlightColor')} solid`,
});

const slashKey = <span css={hotKeyStyle}>/</span>;
const equalsKey = <span css={hotKeyStyle}>=</span>;

export const ParagraphPlaceholder: React.FC = () => (
  <>
    Type {slashKey} for new blocks or {equalsKey} for an input
  </>
);
