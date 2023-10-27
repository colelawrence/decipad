import {
  createTPluginFactory,
  MyGenericEditor,
  MyKeyboardHandler,
} from '@decipad/editor-types';
import { Value } from '@udecode/plate';

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
  createTPluginFactory<object, TV, TE>({
    key: name,
    handlers: {
      onKeyDown: plugin,
    },
  });
