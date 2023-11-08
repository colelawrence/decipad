import { RootDocument } from '@decipad/editor-types';
import { getRemoteComputer } from '@decipad/remote-computer';
import { fullRootEditorToProgram } from '@decipad/editor-language-elements';
import { formatError } from '@decipad/format';

type ValidateCodeResult = { valid: true } | { valid: false; error: string };

export const validateCode = async (
  code: string,
  notebook: RootDocument
): Promise<ValidateCodeResult> => {
  const computer = getRemoteComputer();

  const program = await fullRootEditorToProgram(notebook, computer);

  computer.pushCompute({
    program,
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
