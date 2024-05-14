import type { PlateComponent } from '@decipad/editor-types';
import { ClientEventsContext } from '@decipad/client-events';
import { ELEMENT_SLIDER } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { Slider as UISlider } from '@decipad/ui';
import { useCallback, useContext } from 'react';
import { useVariableEditorContext } from './VariableEditorContext';
import { useOnSliderChange } from '../hooks';

export const Slider: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_SLIDER);
  const [value, onChange, setSyncValues] = useOnSliderChange(element);

  // Analytics
  const userEvents = useContext(ClientEventsContext);
  const isReadOnly = useIsEditorReadOnly();
  const onCommit = useCallback(() => {
    setSyncValues(true);
    userEvents({
      segmentEvent: {
        type: 'action',
        action: 'widget value updated',
        props: {
          variant: 'slider',
          isReadOnly,
        },
      },
      gaEvent: {
        category: 'widget',
        action: 'widget value updated',
        label: 'slider',
      },
    });
  }, [isReadOnly, userEvents, setSyncValues]);

  const { color } = useVariableEditorContext();

  return (
    <div {...attributes} contentEditable={false}>
      {children}
      <UISlider
        {...element}
        min={Number(element.min)}
        max={Number(element.max)}
        step={Number(element.step)}
        onChange={(e) => {
          setSyncValues(false);
          onChange(e);
        }}
        value={value ?? 0}
        color={color}
        onCommit={onCommit}
      />
    </div>
  );
};
