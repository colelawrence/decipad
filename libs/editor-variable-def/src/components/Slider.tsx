import { atoms } from '@decipad/ui';
import {
  ELEMENT_SLIDER,
  PlateComponent,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { useElementMutatorCallback } from '@decipad/editor-utils';

export const Slider: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_SLIDER) {
    throw new Error(`Slider is meant to render slider elements`);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = useTPlateEditorRef()!;
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
