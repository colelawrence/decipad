import type { Path } from 'slate';
import cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import type { TEditor } from '@udecode/plate-common';
import type { Computer } from '@decipad/computer-interfaces';
import type {
  TimeSeriesElement,
  TimeSeriesHeaderRowElement,
} from '@decipad/editor-types';
import {
  ELEMENT_TIME_SERIES,
  ELEMENT_TIME_SERIES_TR,
  ELEMENT_TIME_SERIES_CAPTION,
  ELEMENT_TIME_SERIES_NAME,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';

const getInitialTimeSeriesElement = (
  computer: Computer,
  blockId?: string,
  varName?: string
): TimeSeriesElement => {
  return {
    id: nanoid(),
    type: ELEMENT_TIME_SERIES,
    expandedGroups: [],
    varName: blockId,
    children: [
      {
        id: nanoid(),
        type: ELEMENT_TIME_SERIES_CAPTION,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_TIME_SERIES_NAME,
            children: [
              {
                text: computer?.getAvailableIdentifier(
                  varName ? `${varName}Data` : 'TimeSeries'
                ),
              },
            ],
          },
        ],
      },
      {
        id: nanoid(),
        type: ELEMENT_TIME_SERIES_TR,
        children: [{ text: '' }],
      } as unknown as TimeSeriesHeaderRowElement,
    ],
  };
};

export const insertTimeSeriesBelow = async (
  editor: TEditor,
  path: Path,
  computer: Computer,
  blockId?: string,
  varName?: string
): Promise<void> => {
  const TimeSeries = cloneDeep(
    await getInitialTimeSeriesElement(computer, blockId, varName)
  );
  insertNodes(editor, [TimeSeries], {
    at: requirePathBelowBlock(editor, path),
  });
};
