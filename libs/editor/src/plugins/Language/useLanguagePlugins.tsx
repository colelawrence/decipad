// import { createSyntaxErrorHighlightPlugin } from '@decipad/editor-plugins';
import { PlatePlugin } from '@udecode/plate';
import { useEffect, useState } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { createCodeLinePlugin } from '@decipad/editor-plugins';
import { createVariableDefPlugin } from '@decipad/editor-variable-def';
import { Computer } from '@decipad/language';
import { createCursorsPlugin } from './cursorsPlugin';
import { createUpdateComputerPlugin } from './updateComputerPlugin';

const createLanguagePlugin = (computer: Computer): PlatePlugin => {
  return {
    key: 'USE_LANGUAGE_PLUGIN',
    plugins: [
      createCodeLinePlugin(computer),
      createCursorsPlugin(computer),
      createUpdateComputerPlugin(computer),
      createVariableDefPlugin(computer),
    ],
  };
};

export const useLanguagePlugin = (): PlatePlugin => {
  const computer = useComputer();
  const [plugin, setPlugin] = useState<PlatePlugin>(() =>
    createLanguagePlugin(computer)
  );

  useEffect(() => {
    setPlugin(createLanguagePlugin(computer));
  }, [computer]);

  return plugin;
};
