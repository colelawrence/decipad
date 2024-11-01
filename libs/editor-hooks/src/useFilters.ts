import { useCallback, useEffect, useState } from 'react';
import { assert } from '@decipad/utils';
import { EditorController } from 'libs/notebook-tabs/src/EditorController';
import { Filter } from '@decipad/editor-types';
import { omit } from 'lodash';

export type EditableFilter = Filter & {
  integrationId: string;
  filterIndex: number;
};

export const useFilters = (
  controller: EditorController
): {
  filters: EditableFilter[];
  deleteFilter: (filter: EditableFilter) => void;
} => {
  const [children, setChildren] = useState(controller?.children);

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
        grandchild.filters?.map((filter, i) => ({
          ...filter,
          integrationId: grandchild.id as string,
          filterIndex: i,
        })) || []
      );
    });
  });

  const deleteFilter = useCallback(
    (filter: EditableFilter) => {
      const integrationEntry = controller.getEntryFromId(filter.integrationId);
      assert(integrationEntry != null);
      const [block, path] = integrationEntry;

      controller.apply({
        type: 'set_node',
        path,
        properties: omit(block, 'children'),
        newProperties: {
          ...omit(block, 'children'),
          filters: filters.filter(({ id }) => {
            return id !== filter.id;
          }),
        },
      });
    },
    [filters, controller]
  );

  return { filters, deleteFilter };
};
