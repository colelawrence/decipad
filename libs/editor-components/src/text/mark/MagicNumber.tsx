import { Result } from '@decipad/computer';
import { PlateComponent } from '@decipad/editor-types';
import { useComputer, useIsEditorReadOnly } from '@decipad/react-contexts';
import { atoms } from '@decipad/ui';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useObservable } from 'rxjs-hooks';

export const MagicNumber: PlateComponent = ({ attributes, text, children }) => {
  const computer = useComputer();
  const varName = text?.text ?? '';
  const [result, setResult] = useState<Result | null>(null);
  useEffect(() => {
    const sub = computer.getVariable$(varName).subscribe(setResult);
    return () => sub.unsubscribe();
  }, [computer, varName]);

  const readOnly = useIsEditorReadOnly();

  const defBlockId = useObservable(() => computer.getBlockId$(varName));

  return (
    <span {...attributes}>
      <atoms.MagicNumber
        onClick={() => {
          if (typeof defBlockId === 'string') {
            const el = document.getElementById(defBlockId);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el?.focus();
          }
        }}
        result={result}
        readOnly={readOnly}
      />
      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};
