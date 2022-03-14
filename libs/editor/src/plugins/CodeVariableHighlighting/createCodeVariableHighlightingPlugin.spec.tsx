import { findParentWithStyle } from '@decipad/dom-test-utils';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { render } from '@testing-library/react';
import { createCodeBlockPlugin, Plate, TElement } from '@udecode/plate';
import { createCodeVariableHighlightingPlugin } from './createCodeVariableHighlightingPlugin';

it('highlights identifiers specially', () => {
  const { getByText } = render(
    <Plate
      initialValue={[
        {
          type: ELEMENT_CODE_BLOCK,
          children: [
            {
              type: ELEMENT_CODE_LINE,
              children: [{ text: 'id=42' }],
            } as TElement,
          ],
        },
      ]}
      plugins={[
        createCodeBlockPlugin(),
        createCodeVariableHighlightingPlugin(),
      ]}
    />
  );
  expect(
    findParentWithStyle(getByText(/id/), 'backgroundColor')?.backgroundColor
  ).not.toEqual(
    findParentWithStyle(getByText(/42/), 'backgroundColor')?.backgroundColor
  );
});
