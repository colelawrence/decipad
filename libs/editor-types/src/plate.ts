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
  PlatePlugin,
  PlatePluginInsertData,
  PlatePluginProps,
  PlateProps,
  PluginOptions,
  SerializeHtml,
  WithOverride,
} from '@udecode/plate';
import { MyEditor } from './nodes';
import { MyValue } from './value';

/**
 * Plate types
 */

export type MyDecorate<P = PluginOptions> = Decorate<P, MyValue, MyEditor>;
export type MyDecorateEntry = DecorateEntry<MyValue>;
export type MyDOMHandler<P = PluginOptions> = DOMHandler<P, MyValue, MyEditor>;
export type MyInjectComponent = InjectComponent<MyValue>;
export type MyInjectProps = InjectProps<MyValue>;
export type MyKeyboardHandler<P = PluginOptions> = KeyboardHandler<
  P,
  MyValue,
  MyEditor
>;
export type MyOnChange<P = PluginOptions> = OnChange<P, MyValue, MyEditor>;
export type MyOverrideByKey = OverrideByKey<MyValue, MyEditor>;
export type MyPlatePlugin<P = PluginOptions> = PlatePlugin<
  P,
  MyValue,
  MyEditor
>;
export type MyPlatePluginInsertData = PlatePluginInsertData<MyValue>;
export type MyPlatePluginProps = PlatePluginProps<MyValue>;
export type MyPlateProps = PlateProps<MyValue, MyEditor>;
export type MySerializeHtml = SerializeHtml<MyValue>;
export type MyWithOverride<P = PluginOptions> = WithOverride<
  P,
  MyValue,
  MyEditor
>;

/**
 * My plugins
 */

export type MyAutoformatRule = AutoformatRule<MyValue, MyEditor>;
