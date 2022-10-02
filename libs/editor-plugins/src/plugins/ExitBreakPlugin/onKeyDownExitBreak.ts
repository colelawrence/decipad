import {
  getBlockAbove,
  KeyboardHandlerReturnType,
  PlateEditor,
  queryNode,
  Value,
  WithPlatePlugin,
  ExitBreakPlugin,
} from '@udecode/plate';
import isHotkey from 'is-hotkey';
import { exitBreak } from './exitBreak';

export const onKeyDownExitBreak =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { options: { rules = [] } }: WithPlatePlugin<ExitBreakPlugin, V, E>
  ): KeyboardHandlerReturnType =>
  (event) => {
    const entry = getBlockAbove(editor);
    if (!entry) return;

    rules.forEach(({ hotkey, ...rule }) => {
      if (isHotkey(hotkey, event as any) && queryNode(entry, rule.query)) {
        if (exitBreak(editor as any, rule)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    });
  };
