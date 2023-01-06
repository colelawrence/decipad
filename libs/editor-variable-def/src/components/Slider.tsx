import { useCallback, useContext } from 'react';
import { Slider as UISlider } from '@decipad/ui';
import {
  ELEMENT_SLIDER,
  PlateComponent,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { ReactEditor } from 'slate-react';
import { setSelection } from '@udecode/plate';
import { ClientEventsContext } from '@decipad/client-events';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { useVariableEditorContext } from './VariableEditorContext';

export const Slider: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_SLIDER) {
    throw new Error(`Slider is meant to render slider elements`);
  }

  const editor = useTPlateEditorRef();

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
        onFocus={selectElement}
        color={color}
        onCommit={onCommit}
      />
    </div>
  );
};
