import { findParentWithStyle } from '@decipad/dom-test-utils';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { DraggableBlock } from './DraggableBlock';
import { Plate } from '@udecode/plate-common';

const props: ComponentProps<typeof DraggableBlock> = {
  blockKind: 'paragraph',
  children: <p>block</p>,
  onDelete: noop,
};

it('opens the menu when clicking the drag handle', async () => {
  const { getByTitle, getAllByTitle, queryByTitle } = render(
    <Plate>
      <DraggableBlock {...props} />
    </Plate>
  );
  expect(queryByTitle(/trash/i)).not.toBeInTheDocument();

  await userEvent.click(getAllByTitle(/drag/i)[0]);

  expect(getByTitle(/trash/i)).toBeInTheDocument();
}, 20_000);

it('changes opacity when being dragged', () => {
  const { getByText, rerender } = render(
    <Plate>
      <DraggableBlock {...props} isBeingDragged={false} />
    </Plate>
  );
  const normalOpacity = findParentWithStyle(
    getByText('block'),
    'opacity'
  )?.opacity;

  rerender(
    <Plate>
      <DraggableBlock {...props} isBeingDragged />
    </Plate>
  );
  const beingDraggedOpacity = findParentWithStyle(
    getByText('block'),
    'opacity'
  )?.opacity;
  expect(beingDraggedOpacity).not.toEqual(normalOpacity);
});
