import { atoms } from '@decipad/ui';
import { PlateComponent, ELEMENT_SLIDER } from '@decipad/editor-types';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { usePlateEditorRef } from '@udecode/plate';

export const Slider: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_SLIDER) {
    throw new Error(`Slider is meant to render slider elements`);
  }

  const editor = usePlateEditorRef();
  const onValueChange = useElementMutatorCallback(editor, element, 'value');

  return (
    <div {...attributes}>
      {children}
      <div contentEditable={false}>
        <atoms.Slider {...element} onChange={onValueChange} />
      </div>
    </div>
  );
};
