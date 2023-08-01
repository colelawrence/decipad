/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { cssVar, p14Regular } from '../../primitives';

export const CodeLinePlaceholder: React.FC<{
  height: number;
  onBringBack?(): void;
}> = ({ height, onBringBack }) => (
  <div contentEditable={false} css={[wrapperStyle, { height: `${height}px` }]}>
    This calculation is currently displayed elsewhere.
    {` `}
    <button css={linkStyle} onMouseDown={onBringBack}>
      Bring it back.
    </button>
  </div>
);

const wrapperStyle = css([
  p14Regular,
  {
    opacity: 0.6,
    borderRadius: '10px',
    padding: '6px 12px',

    border: `1px solid ${cssVar('borderSubdued')}`,
    backgroundColor: cssVar('backgroundDefault'),

    display: 'flex',
    alignItems: 'center',
    cursor: 'default',

    userSelect: 'none',
  },
]);

const linkStyle = css({
  cursor: 'pointer',
  textDecoration: 'underline',
});
