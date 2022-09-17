import {
  AutoformatPlugin,
  createAutoformatPlugin,
  createPlateEditor,
  CreatePlateEditorOptions,
  createPluginFactory,
  getTEditor,
  NoInfer,
  PlatePlugin,
  PluginOptions,
  useEditorRef,
  useEditorState,
  usePlateEditorRef,
  usePlateEditorState,
  usePlateSelectors,
} from '@udecode/plate';
import { MyValue } from './value';
import { MyEditor } from './nodes';
import { MyOverrideByKey, MyPlatePlugin } from './plate';

/**
 * Plate store, Slate context
 */

export const getMyEditor = (editor: MyEditor) =>
  getTEditor<MyValue, MyEditor>(editor);
export const useTEditorRef = () => useEditorRef<MyValue, MyEditor>();
export const useTEditorState = () => useEditorState<MyValue, MyEditor>();
export const useTPlateEditorRef = (id?: string) =>
  usePlateEditorRef<MyValue, MyEditor>(id);
export const useTPlateEditorState = (id?: string) =>
  usePlateEditorState<MyValue, MyEditor>(id);
export const useTPlateSelectors = (id?: string) =>
  usePlateSelectors<MyValue, MyEditor>(id);

/**
 * Utils
 */

export const createTPlateEditor = (
  options: CreatePlateEditorOptions<MyValue, MyEditor> = {}
) => createPlateEditor<MyValue, MyEditor>(options);
export const createTPluginFactory = <P = PluginOptions>(
  defaultPlugin: PlatePlugin<NoInfer<P>, MyValue, MyEditor>
) => createPluginFactory(defaultPlugin);

/**
 * My plugins
 */

export const createTAutoformatPlugin = (
  override?: Partial<MyPlatePlugin<AutoformatPlugin<MyValue, MyEditor>>>,
  overrideByKey?: MyOverrideByKey
) =>
  createAutoformatPlugin<
    AutoformatPlugin<MyValue, MyEditor>,
    MyValue,
    MyEditor
  >(override, overrideByKey);
