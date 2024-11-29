import { useCallback, useEffect, useState } from 'react';
import { assert } from '@decipad/utils';
import { EditorController } from 'libs/notebook-tabs/src/EditorController';
import {
  ELEMENT_INTEGRATION,
  Filter,
  IntegrationTypes,
} from '@decipad/editor-types';
import { omit } from 'lodash';
import DeciNumber from '@decipad/number';

export type EditableFilter = Filter & {
  integrationId: string;
  filterIndex: number;
};

export const useFilters = (
  controller: EditorController
): {
  hasIntegrations: boolean;
  filters: EditableFilter[];
  deleteFilter: (filter: EditableFilter) => void;
} => {
  const [children, setChildren] = useState(controller?.children);

  const hasIntegrations = children.some((child) => {
    return (
      child.type === 'tab' &&
      child.children.some((grandChild) => {
        return grandChild.type === 'integration-block';
      })
    );
  });

  // TODO use this to subscribe to changes!
  useEffect(() => {
    controller?.events.subscribe(() => {
      // YOLO!
      setTimeout(() => {
        setChildren(controller?.children);
      }, 0);
    });
  }, [controller?.children, controller?.events]);

  const filters = children?.flatMap((child) => {
    if (child.type !== 'tab') return [];
    return child.children.flatMap((grandchild) => {
      if (grandchild.type !== 'integration-block') return [];
      assert(grandchild.id != null);

      return (
        grandchild.filters?.map((filter, i): EditableFilter => {
          switch (filter.type) {
            case 'string':
              return {
                ...filter,
                value: filter.value,
                integrationId: grandchild.id as string,
                filterIndex: i,
              };
            case 'number':
              return {
                ...filter,
                value: new DeciNumber(filter.value),
                integrationId: grandchild.id as string,
                filterIndex: i,
              };
            case 'date':
              return {
                ...filter,
                value: filter.value,
                integrationId: grandchild.id as string,
                filterIndex: i,
              };
          }
        }) || []
      );
    });
  });

  const deleteFilter = useCallback(
    (filter: EditableFilter) => {
      const integrationEntry = controller.getEntryFromId(filter.integrationId);
      assert(integrationEntry != null);
      const [block, path] = integrationEntry;
      assert(block.id === filter.integrationId);
      assert(block.type === ELEMENT_INTEGRATION);
      const newFilters: IntegrationTypes.SerializedFilter[] =
        block.filters?.filter(({ id }) => {
          return id !== filter.id;
        }) ?? [];

      controller.apply({
        type: 'set_node',
        path,
        properties: omit(
          block,
          'children'
        ) satisfies Partial<IntegrationTypes.IntegrationBlock>,
        newProperties: {
          ...omit(block, 'children'),
          filters: newFilters,
          // Update timeOfLastRun to refresh the integration.
          timeOfLastRun: Date.now().toString(),
        } satisfies Partial<IntegrationTypes.IntegrationBlock>,
      });
    },
    [controller]
  );

  return { hasIntegrations, filters, deleteFilter };
};
