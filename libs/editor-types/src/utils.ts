import {
  type AutoformatPlugin,
  createAutoformatPlugin,
  createPlateEditor,
  type CreatePlateEditorOptions,
  createPluginFactory,
  getTEditor,
  type NoInfer,
  type PlatePlugin,
  type PluginOptions,
  useEditorRef,
  usePlateEditorRef,
  usePlateEditorState,
  usePlateSelectors,
  Value,
  TEditor,
} from '@udecode/plate';
import type { MyValue, NotebookValue } from './value';
import type { MyEditor, MyGenericEditor, RootEditor } from './nodes';
import type {
  MyOverrideByKey,
  MyPlatePlugin,
  RootPlatePlugin,
  RootOverrideByKey,
} from './plate';

/**
 * Plate store, Slate context
 */

export const getMyEditor = <
  TV extends Value,
  TE extends TEditor<TV> = TEditor<TV>
>(
  editor: TE
) => getTEditor<TV, TE>(editor);

export const useTEditorRef = () => useEditorRef<MyValue, MyEditor>();

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

export const createTPlateRootEditor = (
  options: CreatePlateEditorOptions<NotebookValue, RootEditor> = {}
) => createPlateEditor<NotebookValue, RootEditor>(options);

export const createTPluginFactory = <
  P = PluginOptions,
  V extends Value = MyValue,
  E extends MyGenericEditor<V> = MyGenericEditor<V>
>(
  defaultPlugin: PlatePlugin<NoInfer<P>, V, E>
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

export const createTRootAutoformatPlugin = (
  override?: Partial<
    RootPlatePlugin<AutoformatPlugin<NotebookValue, RootEditor>>
  >,
  overrideByKey?: RootOverrideByKey
) =>
  createAutoformatPlugin<
    AutoformatPlugin<NotebookValue, RootEditor>,
    NotebookValue,
    RootEditor
  >(override, overrideByKey);
