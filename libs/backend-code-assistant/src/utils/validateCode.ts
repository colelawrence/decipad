import type { RootDocument } from '@decipad/editor-types';
// eslint-disable-next-line no-restricted-imports
import { getComputer } from '@decipad/computer';
import { fullRootEditorToProgram } from '@decipad/editor-language-elements';
import { formatError } from '@decipad/format';

type ValidateCodeResult = { valid: true } | { valid: false; error: string };

export const validateCode = async (
  code: string,
  notebook: RootDocument
): Promise<ValidateCodeResult> => {
  const computer = getComputer();

  const program = await fullRootEditorToProgram(notebook, computer);

  computer.pushComputeDelta({
    program: {
      upsert: program,
    },
  });
  return new Promise((resolve) => {
    const sub = computer.blockResultFromText$(code).subscribe((result) => {
      sub.unsubscribe();
      if (result.type.kind === 'type-error') {
        resolve({
          valid: false,
          error: formatError('en-US', result.type.errorCause),
        });
      } else {
        resolve({ valid: true });
      }
    });
  });
};
