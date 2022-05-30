import { Result } from '@decipad/computer';
import { PlateComponent } from '@decipad/editor-types';
import { useComputer, useIsEditorReadOnly } from '@decipad/react-contexts';
import { atoms } from '@decipad/ui';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useObservable } from 'rxjs-hooks';

export const MagicNumber: PlateComponent = ({ attributes, text, children }) => {
  const computer = useComputer();
  const exp = text?.text ?? '';
  const [result, setResult] = useState<Result.Result | null>(null);
  useEffect(() => {
    const sub = computer.expressionResultFromText$(exp).subscribe(setResult);
    return () => sub.unsubscribe();
  }, [computer, exp]);

  const loadingState =
    result?.type?.kind === 'type-error' ||
    (result?.type?.kind === 'number' &&
      result?.type?.unit?.args[0].unit === exp);

  const readOnly = useIsEditorReadOnly();

  const defBlockId = useObservable(() => computer.getBlockId$(exp));

  return (
    <span {...attributes}>
      <atoms.MagicNumber
        loadingState={loadingState}
        result={result}
        onClick={() => {
          // if it's a variable name, we can navigate to it.
          if (typeof defBlockId === 'string') {
            const el = document.getElementById(defBlockId);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el?.focus();
          }
        }}
        readOnly={readOnly}
      ></atoms.MagicNumber>
      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};
