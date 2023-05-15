import { ClientEventsContext } from '@decipad/client-events';
import {
  ELEMENT_SLIDER,
  PlateComponent,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { Slider as UISlider } from '@decipad/ui';
import { useCallback, useContext } from 'react';
import { useVariableEditorContext } from './VariableEditorContext';

export const Slider: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_SLIDER);
  const editor = useTPlateEditorRef();

  const path = useNodePath(element);
  const onValueChange = usePathMutatorCallback(editor, path, 'value');

  const onChange = useCallback(
    (newValue: number) => {
      onValueChange(newValue.toString());
    },
    [onValueChange]
  );

  // Analytics
  const userEvents = useContext(ClientEventsContext);
  const isReadOnly = useIsEditorReadOnly();
  const onCommit = useCallback(() => {
    userEvents({
      type: 'action',
      action: 'widget value updated',
      props: {
        variant: 'slider',
        isReadOnly,
      },
    });
  }, [isReadOnly, userEvents]);

  const { color } = useVariableEditorContext();

  return (
    <div {...attributes} contentEditable={false}>
      {children}
      <UISlider
        {...element}
        min={Number(element.min)}
        max={Number(element.max)}
        step={Number(element.step)}
        onChange={onChange}
        value={Number(element.value)}
        color={color}
        onCommit={onCommit}
      />
    </div>
  );
};
