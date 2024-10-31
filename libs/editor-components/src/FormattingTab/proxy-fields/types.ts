import { MyEditor } from '@decipad/editor-types';
import { MultipleNodeProxyProperty } from '../proxy';
import { ReactNode } from 'react';

export interface ProxyFieldProps<T> {
  editor: MyEditor;
  label: ReactNode;
  property: MultipleNodeProxyProperty<T>;
  onChange: (editor: MyEditor, value: T) => void;
}
