import { DataViewElement } from '@decipad/editor-types';
import { Program, shadowExprRef } from '@decipad/remote-computer';
import { parseElementAsVariableAssignment } from '../../utils/parseElementAsVariableAssignment';
import { getNodeString } from '@udecode/plate-common';

export const dataViewToOutputAssign = (dataView: DataViewElement): Program =>
  parseElementAsVariableAssignment(
    dataView.id,
    getNodeString(dataView.children[0].children[0]),
    {
      type: 'directive',
      args: [
        'as',
        { type: 'ref', args: [shadowExprRef(dataView.id)] },
        { type: 'ref', args: ['table'] },
      ],
    }
  );
