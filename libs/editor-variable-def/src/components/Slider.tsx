import { atoms } from '@decipad/ui';
import {
  ELEMENT_SLIDER,
  PlateComponent,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { ReactEditor } from 'slate-react';
import { setSelection } from '@udecode/plate';
import { useCallback } from 'react';

export const Slider: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_SLIDER) {
    throw new Error(`Slider is meant to render slider elements`);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = useTPlateEditorRef()!;

  const selectElement = useCallback(() => {
    const point = {
      path: ReactEditor.findPath(editor as ReactEditor, element),
      offset: 0,
    };
    setSelection(editor, {
      anchor: point,
      focus: point,
    });
  }, [editor, element]);

  const onValueChange = useElementMutatorCallback(
    editor,
    element,
    'value',
    selectElement
  );

  return (
    <div {...attributes} contentEditable={false}>
      {children}
      <atoms.Slider
        {...element}
        onChange={onValueChange}
        onFocus={selectElement}
      />
    </div>
  );
};
