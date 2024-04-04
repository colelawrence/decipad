import {
  createPlateEditor,
  type CreatePlateEditorOptions,
  createPluginFactory,
  createPlugins,
  getTEditor,
  type NoInfer,
  type PlatePlugin,
  type PluginOptions,
  useEditorRef,
  type TEditor,
  type Value,
} from '@udecode/plate-common';
import {
  type AutoformatPlugin,
  createAutoformatPlugin,
} from '@udecode/plate-autoformat';
import type { MyValue, NotebookValue } from './value';
import type { MyEditor, MyGenericEditor, RootEditor } from './nodes';
import type { MyOverrideByKey, MyPlatePlugin } from './plate';

/**
 * Plate store, Slate context
 */

export const getMyEditor = <
  TV extends Value,
  TE extends TEditor<TV> = TEditor<TV>
>(
  editor: TE
) => getTEditor<TV, TE>(editor);

export const useMyEditorRef = (id?: string) =>
  useEditorRef<MyValue, MyEditor>(id);

/**
 * Utils
 */

export const createMyPlateEditor = (
  options: Omit<CreatePlateEditorOptions<MyValue, MyEditor>, 'plugins'> & {
    plugins?: MyPlatePlugin[];
  } = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => createPlateEditor<MyValue, MyEditor>(options as any) as MyEditor;

export const createMyPlugins = (
  plugins: MyPlatePlugin[],
  options?: Parameters<typeof createPlugins>[1]
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createPlugins<MyValue, MyEditor>(plugins as any, options) as MyPlatePlugin[];

export const createMyPlateRootEditor = (
  options: CreatePlateEditorOptions<NotebookValue, RootEditor> = {}
) => createPlateEditor<NotebookValue, RootEditor>(options) as RootEditor;

export const createMyPluginFactory = <
  P = PluginOptions,
  V extends Value = MyValue,
  E extends MyGenericEditor<V> = MyGenericEditor<V>
>(
  defaultPlugin: PlatePlugin<NoInfer<P>, V, E>
) => createPluginFactory(defaultPlugin);

/**
 * My plugins
 */

export const createMyAutoformatPlugin = (
  override?: Partial<MyPlatePlugin<AutoformatPlugin<MyValue, MyEditor>>>,
  overrideByKey?: MyOverrideByKey
) =>
  createAutoformatPlugin<
    AutoformatPlugin<MyValue, MyEditor>,
    MyValue,
    MyEditor
  >(override, overrideByKey);
