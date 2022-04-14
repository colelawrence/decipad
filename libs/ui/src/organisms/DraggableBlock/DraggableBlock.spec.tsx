import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { DraggableBlock } from './DraggableBlock';

const props: ComponentProps<typeof DraggableBlock> = {
  blockKind: 'paragraph',
  children: <p>block</p>,
};

it('opens the menu when clicking the drag handle', async () => {
  const { getByTitle, queryByTitle } = render(<DraggableBlock {...props} />);
  expect(queryByTitle(/delete/i)).not.toBeInTheDocument();

  await userEvent.click(getByTitle(/drag/i));
  expect(getByTitle(/delete/i)).toBeInTheDocument();
});

it('changes opacity when being dragged', () => {
  const { getByText, rerender } = render(
    <DraggableBlock {...props} isBeingDragged={false} />
  );
  const normalOpacity = findParentWithStyle(
    getByText('block'),
    'opacity'
  )?.opacity;

  rerender(<DraggableBlock {...props} isBeingDragged />);
  const beingDraggedOpacity = findParentWithStyle(
    getByText('block'),
    'opacity'
  )?.opacity;
  expect(beingDraggedOpacity).not.toEqual(normalOpacity);
});

it('does not render a drop line by default', () => {
  const { queryByLabelText } = render(
    <DraggableBlock {...props} dropLine={undefined} />
  );
  expect(queryByLabelText(/drop/i)).not.toBeInTheDocument();
});
/* eslint-disable no-bitwise */
it('can render a drop line above the block', () => {
  const { getByText, getByLabelText } = render(
    <DraggableBlock {...props} dropLine="top" />
  );
  expect(
    getByText('block').compareDocumentPosition(getByLabelText(/drop/i)) &
      Node.DOCUMENT_POSITION_PRECEDING
  ).toBeTruthy();
});
it('can render a drop line below the block', () => {
  const { getByText, getByLabelText } = render(
    <DraggableBlock {...props} dropLine="bottom" />
  );
  expect(
    getByText('block').compareDocumentPosition(getByLabelText(/drop/i)) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});
/* eslint-enable no-bitwise */
