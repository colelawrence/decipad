import { Computer, ComputeRequest } from '@decipad/computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import { editorToProgram } from '@decipad/editor-language-elements';
import { Subject } from 'rxjs';

export interface UpdateComputerPluginProps {
  computeRequests: Subject<ComputeRequest>;
}

export const createUpdateComputerPlugin = (
  computer: Computer
): MyPlatePlugin => ({
  key: 'UPDATE_COMPUTER_PLUGIN',
  withOverrides: (editor) => {
    const { onChange } = editor;
    setTimeout(
      async () => computer.pushCompute(await editorToProgram(editor, computer)),
      0
    );
    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      setTimeout(
        async () =>
          computer.pushCompute(await editorToProgram(editor, computer)),
        0
      );
      onChange();
    };

    return editor;
  },
});
