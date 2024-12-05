import { type TimeSeriesElement } from '@decipad/editor-types';
import { type Program } from '@decipad/computer-interfaces';
import { shadowExprRef } from '@decipad/remote-computer';
import { parseElementAsVariableAssignment } from '../../utils/parseElementAsVariableAssignment';
import { getNodeString } from '@udecode/plate-common';

export const timeSeriesToOutputAssign = (
  timeSeries: TimeSeriesElement
): Program =>
  parseElementAsVariableAssignment(
    timeSeries.id ?? '',
    getNodeString(timeSeries.children[0].children[0]),
    {
      type: 'directive',
      args: [
        'as',
        { type: 'ref', args: [shadowExprRef(timeSeries.id ?? '')] },
        { type: 'ref', args: ['table'] },
      ],
    }
  );
