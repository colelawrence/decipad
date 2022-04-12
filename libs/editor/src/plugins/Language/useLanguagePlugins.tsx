// import { createSyntaxErrorHighlightPlugin } from '@decipad/editor-plugins';
import { createPlugins, PlatePlugin } from '@udecode/plate';
import { useMemo } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { createCodeLinePlugin } from '@decipad/editor-plugins';
import { createVariableDefPlugin } from '@decipad/editor-variable-def';
import { createCursorsPlugin } from './cursorsPlugin';
import { createUpdateComputerPlugin } from './updateComputerPlugin';

export const useLanguagePlugin = (): PlatePlugin => {
  const computer = useComputer();

  return {
    key: 'USE_LANGUAGE_PLUGIN',
    plugins: useMemo(
      () =>
        createPlugins([
          createCodeLinePlugin(computer),
          createCursorsPlugin(computer),
          createUpdateComputerPlugin(computer),
          createVariableDefPlugin(computer),
        ]),
      [computer]
    ),
  };
};
