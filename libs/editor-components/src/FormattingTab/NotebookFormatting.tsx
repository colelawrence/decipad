import { useEditorController } from '@decipad/notebook-state';
import { useWriteOnBlur } from './proxy-fields/ProxyStringField';
import { InputField } from '@decipad/ui';

export const NotebookFormatting = () => {
  const editorController = useEditorController();
  const title = editorController.useTitle();

  const [value, setValue, { onFocus, onBlur, onSubmit }] = useWriteOnBlur(
    title ?? '',
    (newTitle) => editorController.setTitle(newTitle)
  );

  return (
    <InputField
      type="text"
      size="small"
      label="Notebook title"
      value={value}
      // placeholder={varies ? 'Multiple' : ''}
      onChange={(newValue) => setValue(newValue)}
      onFocus={onFocus}
      onBlur={onBlur}
      onEnter={onSubmit}
    />
  );
};
