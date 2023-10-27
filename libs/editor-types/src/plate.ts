import type {
  AutoformatRule,
  Decorate,
  DecorateEntry,
  DOMHandler,
  InjectComponent,
  InjectProps,
  KeyboardHandler,
  OnChange,
  OverrideByKey,
  PlateEditor,
  PlatePlugin,
  PlatePluginInsertData,
  PlatePluginProps,
  PlateProps,
  PluginOptions,
  SerializeHtml,
  Value,
  WithOverride,
} from '@udecode/plate';
import type { MyEditor, MyGenericEditor, RootEditor } from './nodes';
import type { MyValue, NotebookValue } from './value';

/**
 * Plate types
 */

export type MyDecorate<
  P = PluginOptions,
  V extends Value = MyValue,
  E extends PlateEditor<V> = PlateEditor<V>
> = Decorate<P, V, E>;
export type MyDecorateEntry<TV extends Value = MyValue> = DecorateEntry<TV>;
export type MyDOMHandler<P = PluginOptions> = DOMHandler<P, MyValue, MyEditor>;
export type MyInjectComponent = InjectComponent<MyValue>;
export type MyInjectProps = InjectProps<MyValue>;
export type MyKeyboardHandler<
  P = PluginOptions,
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
> = KeyboardHandler<P, TV, TE>;
export type MyOnChange<P = PluginOptions> = OnChange<P, MyValue, MyEditor>;
export type MyOverrideByKey = OverrideByKey<MyValue, MyEditor>;
export type RootOverrideByKey = OverrideByKey<NotebookValue, RootEditor>;
export type MyPlatePlugin<
  P = PluginOptions,
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
> = PlatePlugin<P, TV, TE>;
export type RootPlatePlugin<P = PluginOptions> = PlatePlugin<
  P,
  NotebookValue,
  RootEditor
>;
export type MyPlatePluginInsertData = PlatePluginInsertData<MyValue>;
export type MyPlatePluginProps = PlatePluginProps<MyValue>;
export type MyPlateProps = PlateProps<MyValue, MyEditor>;
export type MySerializeHtml = SerializeHtml<MyValue>;
export type MyWithOverride<
  P = PluginOptions,
  TV extends Value = MyValue,
  TE extends PlateEditor<TV> = PlateEditor<TV>
> = WithOverride<P, TV, TE>;

/**
 * My plugins
 */

export type MyAutoformatRule = AutoformatRule<MyValue, MyEditor>;
export type RootAutoformatRule = AutoformatRule<NotebookValue, RootEditor>;
