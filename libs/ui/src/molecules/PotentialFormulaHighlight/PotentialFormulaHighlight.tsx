import { LeafAttributes } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css, CSSObject } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Tooltip } from '../../atoms';
import { cssVar, p8Regular } from '../../primitives';

const highlightStyles: CSSObject = {
  textDecoration: 'underline',
  textDecorationStyle: 'dashed',
  textDecorationColor: cssVar('normalTextColor'),
  textDecorationThickness: 1,
  color: cssVar('strongTextColor'),
};
const goToDefStyles = css(p8Regular);

interface PotentialFormulaHighlightProps {
  attributes?: LeafAttributes;
  onCommit?: () => void;
  children?: ReactNode;
}

export const PotentialFormulaHighlight: FC<PotentialFormulaHighlightProps> = ({
  attributes,
  onCommit = noop,
  children,
}) => {
  return (
    <span {...attributes} css={highlightStyles}>
      <Tooltip trigger={<span>{children}</span>}>
        This looks like a formula!
        <button css={goToDefStyles} onClick={onCommit}>
          Make it a formula &rarr;
        </button>
      </Tooltip>
    </span>
  );
};
