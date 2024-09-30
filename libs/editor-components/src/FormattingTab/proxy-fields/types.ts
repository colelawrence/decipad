import { MyEditor } from '@decipad/editor-types';
import { MultipleNodeProxyProperty } from '../proxy';

export interface ProxyFieldProps<T> {
  editor: MyEditor;
  label: string;
  property: MultipleNodeProxyProperty<T>;
  onChange: (editor: MyEditor, value: T) => void;
}
