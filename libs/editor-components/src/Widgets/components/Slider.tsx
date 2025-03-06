import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_SLIDER, ELEMENT_VARIABLE_DEF } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly, useNotebookId } from '@decipad/react-contexts';
import { Slider as UISlider } from '@decipad/ui';
import { useCallback } from 'react';
import { useVariableEditorContext } from './VariableEditorContext';
import { useOnSliderChange } from '../hooks';
import {
  useCreateAnnotationMutation,
  useRecordPadEventMutation,
} from '@decipad/graphql-client';
import { useParentNodeEntry } from '@decipad/editor-hooks';
import { getAnonUserMetadata } from '@decipad/utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useNotebookRoute } from '@decipad/routing';
import { analytics } from '@decipad/client-events';

export const Slider: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_SLIDER);
  const [value, onChange, setSyncValues] = useOnSliderChange(element);

  const parentEntry = useParentNodeEntry(element);
  const parentElement = parentEntry && parentEntry[0];

  const notebookId = useNotebookId();

  const [, createAnnotation] = useCreateAnnotationMutation();
  const [, recordPadEvent] = useRecordPadEventMutation();

  const { aliasId } = useNotebookRoute();

  // Analytics
  const isReadOnly = useIsEditorReadOnly();
  const onCommit = useCallback(async () => {
    if (isFlagEnabled('PRIVATE_LINK_ANALYTICS')) {
      assertElementType(parentElement, ELEMENT_VARIABLE_DEF);

      const meta = (await getAnonUserMetadata()).join(', ');
      if (parentElement && isReadOnly && aliasId) {
        await recordPadEvent({
          padId: notebookId,
          aliasId,
          name: 'value_change',
          meta,
        });
        await createAnnotation({
          type: 'suggestion',
          aliasId,
          meta,
          content: `${parentElement.children[0].children[0].text}, ${value}`,
          blockId: parentElement.id ?? '',
          padId: notebookId,
        });
      }
    }
    setSyncValues(true);
    analytics.track({
      type: 'action',
      action: 'widget value updated',
      props: {
        variant: 'slider',
        isReadOnly,
      },
    });
  }, [
    isReadOnly,
    setSyncValues,
    value,
    createAnnotation,
    recordPadEvent,
    aliasId,
    notebookId,
    parentElement,
  ]);

  const { color } = useVariableEditorContext();

  return (
    <div {...attributes} contentEditable={false}>
      {children}
      <UISlider
        {...element}
        min={Number(element.min)}
        max={Number(element.max)}
        step={Number(element.step)}
        onChange={async (e) => {
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
