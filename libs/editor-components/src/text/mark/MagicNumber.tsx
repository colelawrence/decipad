import { Result } from '@decipad/computer';
import { PlateComponent } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { atoms } from '@decipad/ui';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

export const MagicNumber: PlateComponent = ({ attributes, text, children }) => {
  const computer = useComputer();
  const varName = text?.text ?? '';
  const [result, setResult] = useState<Result | null>(null);
  useEffect(() => {
    const sub = computer.getVariable$(varName).subscribe(setResult);
    return () => sub.unsubscribe();
  }, [computer, varName]);

  return (
    <span {...attributes}>
      <atoms.MagicNumber result={result}></atoms.MagicNumber>
      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};
