import type { RootEditorController } from '@decipad/notebook-tabs';
import type { Computer } from '@decipad/computer-interfaces';
import { fullRootEditorToProgram } from '@decipad/editor-language-elements';

export const syncComputer = async (
  editor: RootEditorController,
  computer: Computer
): Promise<void> => {
  const program = await fullRootEditorToProgram(editor, computer);
  return computer.pushComputeDelta({ program: { upsert: program } });
};
