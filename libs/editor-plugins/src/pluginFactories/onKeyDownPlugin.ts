import type { MyGenericEditor, MyKeyboardHandler } from '@decipad/editor-types';
import { createMyPluginFactory } from '@decipad/editor-types';
import type { Value } from '@udecode/plate-common';

type OnKeyDownFactoryArgs<TV extends Value, TE extends MyGenericEditor<TV>> = {
  name: string;
  plugin: MyKeyboardHandler<object, TV, TE>;
};

export const createOnKeyDownPluginFactory = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>({
  name,
  plugin,
}: OnKeyDownFactoryArgs<TV, TE>) =>
  createMyPluginFactory<object, TV, TE>({
    key: name,
    handlers: {
      onKeyDown: plugin,
    },
  });
