import { css } from '@emotion/react';
import { FC, useEffect, useState } from 'react';
import MathJax from 'react-mathjax-preview';
import { CodeResultProps } from '../../../types';
import { useComputer } from '@decipad/editor-hooks';

const functionResultStyles = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: 'inline',
  padding: '1px 0px 2px',
  verticalAlign: 'baseline',
  lineHeight: 1.6,
  fontSize: '90%',
});

export const ExpandedFunctionResult: FC<CodeResultProps<'function'>> = ({
  blockId,
}) => {
  const computer = useComputer();
  const [math, setMath] = useState('');

  useEffect(() => {
    if (blockId) {
      const sub = computer.blockToMathML$(blockId).subscribe(setMath);
      return () => sub.unsubscribe();
    }
    return undefined;
  }, [blockId, computer]);

  return (
    <span data-highlight-changes css={functionResultStyles}>
      <MathJax math={math}></MathJax>
    </span>
  );
};
