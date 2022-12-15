import { LeafAttributes } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { forwardRef, ReactNode } from 'react';
import { Tooltip } from '../../atoms';
import { cssVar, grey400, grey500, grey600, p12Medium } from '../../primitives';

const highlightStyles = css({
  color: cssVar('strongTextColor'),
  borderBottom: `1px dashed ${cssVar('normalTextColor')}`,
});

const activateStyles = css({
  textDecoration: 'underline',
});

const tabKeyStyles = css({
  display: 'inline-flex',
  padding: '0 4px',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  border: `1px solid ${grey500.rgb}`,
  background: grey600.rgb,
  color: grey400.rgb,
  margin: '0 2px',
});

const tooltipContentStyles = css({ ...p12Medium });

interface PotentialFormulaHighlightProps {
  attributes?: LeafAttributes;
  onClick?: () => void;
  onCommit?: () => void;
  tooltipOpen?: boolean | undefined;
  children?: ReactNode;
}

export const PotentialFormulaHighlight = forwardRef<
  HTMLSpanElement,
  PotentialFormulaHighlightProps
>(
  (
    { attributes, onCommit = noop, tooltipOpen = false, onClick, children },
    ref
  ) => {
    return (
      <span
        data-testid="potential-formula"
        {...attributes}
        css={highlightStyles}
        ref={ref}
        onClick={onClick}
      >
        <Tooltip
          onClick={onCommit}
          trigger={<span>{children}</span>}
          open={tooltipOpen}
        >
          <span css={tooltipContentStyles}>
            <button css={activateStyles}>Click to activate</button> (or use{' '}
            <kbd css={tabKeyStyles}>TAB</kbd>)
          </span>
        </Tooltip>
      </span>
    );
  }
);
