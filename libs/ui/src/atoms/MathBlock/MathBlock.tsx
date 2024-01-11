import { css } from '@emotion/react';
import { FC } from 'react';
import MathJax from 'react-mathjax-preview';
import { cssVar } from '../../primitives';
import { Warning } from '../../icons';
import { noop } from '@decipad/utils';

const wrapperStyles = css({
  border: '1px solid',
  borderColor: cssVar('borderSubdued'),
  backgroundColor: cssVar('backgroundMain'),
  padding: '12px 12px',
  borderRadius: 10,
  position: 'relative',
  fontSize: '90%',
  cursor: 'pointer',
});

const warningMessageStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const iconStyles = css({
  height: 16,
  width: 16,

  '& > svg': {
    height: 16,
    width: 16,
  },
});

type MathBlockProps = {
  onReference: () => void;
  onDelete: () => void;
  hasReference: boolean;
  math: string;
  readOnly: boolean;
};

export const MathBlock: FC<MathBlockProps> = ({
  onDelete,
  onReference,
  hasReference,
  math,
  readOnly,
}) => {
  return (
    <div
      data-highlight-changes
      css={wrapperStyles}
      onClick={hasReference ? onReference : readOnly ? noop : onDelete}
    >
      {math ? (
        <MathJax math={math}></MathJax>
      ) : (
        <span css={warningMessageStyles}>
          <span css={iconStyles}>
            <Warning />
          </span>
          {hasReference ? (
            <span>There seems to be an error in this formula.</span>
          ) : (
            <span>
              Looks like original formula is missing.{' '}
              {!readOnly && 'Click to remove.'}
            </span>
          )}
        </span>
      )}
    </div>
  );
};
