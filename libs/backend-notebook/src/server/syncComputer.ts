import { RootEditorController } from '@decipad/notebook-tabs';
import { RemoteComputer } from '@decipad/remote-computer';
import { fullRootEditorToProgram } from '@decipad/editor-language-elements';

export const syncComputer = async (
  editor: RootEditorController,
  computer: RemoteComputer
): Promise<void> => {
  const program = await fullRootEditorToProgram(editor, computer);
  computer.pushCompute({ program });
  await computer.flush();
};
