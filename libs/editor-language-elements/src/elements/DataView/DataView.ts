import { Program } from '@decipad/remote-computer';
import { ELEMENT_DATA_VIEW } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../../types';
import { dataViewShadowValueAssign } from './dataViewShadowValueAssign';
import { dataViewToOutputAssign } from './dataViewToOutputAssign';

export const DataView: InteractiveLanguageElement = {
  type: ELEMENT_DATA_VIEW,
  getParsedBlockFromElement: (_editor, _computer, element) => {
    assertElementType(element, ELEMENT_DATA_VIEW);

    const shadowValueAssign: Program = dataViewShadowValueAssign(element);
    const outputValueAssign: Program = dataViewToOutputAssign(element);

    return [...shadowValueAssign, ...outputValueAssign];
  },
};
