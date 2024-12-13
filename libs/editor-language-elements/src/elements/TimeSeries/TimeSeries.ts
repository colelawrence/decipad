import { type Program } from '@decipad/computer-interfaces';
import { ELEMENT_TIME_SERIES } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { type InteractiveLanguageElement } from '../../types';
import { dataViewShadowValueAssign } from '../DataView/dataViewShadowValueAssign';
import { dataViewToOutputAssign } from '../DataView/dataViewToOutputAssign';

export const TimeSeries: InteractiveLanguageElement = {
  type: ELEMENT_TIME_SERIES,
  getParsedBlockFromElement: (_editor, _computer, element) => {
    assertElementType(element, ELEMENT_TIME_SERIES);

    const shadowValueAssign: Program = dataViewShadowValueAssign(element);
    const outputValueAssign: Program = dataViewToOutputAssign(element);

    return [...shadowValueAssign, ...outputValueAssign];
  },
};
