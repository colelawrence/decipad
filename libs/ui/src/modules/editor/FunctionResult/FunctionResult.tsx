import { css } from '@emotion/react';
import { FC, useEffect, useState } from 'react';
import MathJax from 'react-mathjax-preview';
import { CodeResultProps } from '../../../types';
import { Tooltip } from '../../../shared/atoms/Tooltip/Tooltip';
import { useComputer } from '@decipad/editor-hooks';

const functionResultStyles = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: 'inline',
  verticalAlign: 'baseline',
  lineHeight: 1.2,
});

export const FunctionResult: FC<CodeResultProps<'function'>> = ({
  element,
}) => {
  const computer = useComputer();
  const [math, setMath] = useState('');
  useEffect(() => {
    if (element) {
      const sub = computer.blockToMathML$(element.id).subscribe(setMath);
      return () => sub.unsubscribe();
    }
    return undefined;
  }, [computer, element]);
  const trigger = (
    <span data-highlight-changes css={functionResultStyles}>
      ƒ
    </span>
  );

  return (
    <Tooltip trigger={trigger}>
      <MathJax math={math}></MathJax>
    </Tooltip>
  );
};
