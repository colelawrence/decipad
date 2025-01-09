import { Expression as UIExpression } from '@decipad/ui';
import type {
  PlateComponent,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { ELEMENT_EXPRESSION, useMyEditorRef } from '@decipad/editor-types';
import type { SerializedType } from '@decipad/language-interfaces';
import { useSelected } from 'slate-react';
import { getNodeString, getParentNode } from '@udecode/plate-common';
import { useComputer, useNodePath } from '@decipad/editor-hooks';
import { useContext, useRef, useEffect, useMemo } from 'react';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { formatError } from '@decipad/format';
import { docs } from '@decipad/routing';
import { useDelayedTrue } from '@decipad/react-utils';
import { ClientEventsContext } from '@decipad/client-events';
import { useVariableEditorContext } from './VariableEditorContext';

const getPlaceHolder = (type: SerializedType | undefined) => {
  if (!type) return '100$';
  switch (type.kind) {
    case 'string':
      return 'Type here...';
    case 'date':
      switch (type.date) {
        case 'hour':
          return '2001-11-27 17:01';
        case 'day':
          return '2001-11-27';
        case 'month':
          return '2001-11';
        case 'year':
          return '2001';
        default:
          return 'date';
      }
  }
  return '100$';
};

const errorDebounceMs = 500;

export const Expression: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  if (element?.type !== ELEMENT_EXPRESSION) {
    throw new Error(`Expression is meant to render expression elements`);
  }

  const path = useNodePath(element);
  const editor = useMyEditorRef();
  const parent = useMemo(
    () => path && getParentNode<VariableDefinitionElement>(editor, path)?.[0],
    [editor, path]
  );
  const userEvents = useContext(ClientEventsContext);
  const isReadOnly = useIsEditorReadOnly();

  const computer = useComputer();
  const [result, parseError] =
    computer.getBlockIdResult$.useWithSelectorDebounced(
      errorDebounceMs,
      (r) => [r?.result, r?.error?.message],
      parent?.id || ''
    );
  const showParseError = useDelayedTrue(Boolean(parseError));

  const error =
    parseError && showParseError
      ? {
          message: parseError,
          url: docs({}).page({ name: 'errors' }).$,
        }
      : result?.type.kind === 'type-error'
      ? {
          message: formatError('en-US', result.type.errorCause),
          url: docs({}).page({ name: 'errors' }).$,
        }
      : undefined;

  const focused = useSelected();

  const nodeText = getNodeString(element);
  const oldStr = useRef(nodeText);

  const { color } = useVariableEditorContext();

  // Not focused because we don't want to update every time the user types,
  // just when they are done typing, which we assume is when they click away.
  // Sliders can be spammy, so they are handled separately.
  useEffect(() => {
    if (nodeText !== oldStr.current && !focused) {
      oldStr.current = nodeText;
      if (parent && parent.variant !== 'slider') {
        userEvents({
          segmentEvent: {
            type: 'action',
            action: 'widget value updated',
            props: {
              variant: parent.variant,
              isReadOnly,
            },
          },
          gaEvent: {
            category: 'widget',
            action: 'widget value updated',
            label: parent.variant,
          },
        });
      }
    }
  }, [focused, isReadOnly, nodeText, parent, userEvents]);

  return (
    <div {...attributes}>
      <UIExpression
        type={result?.type}
        error={error}
        focused={focused}
        placeholder={
          getNodeString(element)
            ? ''
            : result
            ? getPlaceHolder(result?.type)
            : ''
        }
        color={color}
      >
        {children}
      </UIExpression>
    </div>
  );
};
