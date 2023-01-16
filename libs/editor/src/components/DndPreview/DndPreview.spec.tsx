import { cleanup, render, waitFor } from '@testing-library/react';
import { useEditorRef } from '@udecode/plate';
import { DndPreview } from './DndPreview';

jest.mock('react-dnd-preview', () => ({
  usePreview: jest.fn(() => ({
    itemType: 'column',
    display: true,
  })),
}));

const editor = {
  previewRef: null,
};

jest.mock('@udecode/plate', () => ({
  ...jest.requireActual('@udecode/plate'),
  useEditorRef: () => editor,
}));

jest.mock('./DndColumnPreview', () => ({
  DndColumnPreview: () => {
    return <div data-testid="mock-dnd-column-preview" />;
  },
}));

describe('DndPreview', () => {
  afterEach(cleanup);

  it('should render DndColumnPreview when display is true and itemType is DRAG_ITEM_COLUMN', () => {
    const { getByTestId } = render(<DndPreview />);
    const dndColumnPreview = getByTestId('mock-dnd-column-preview');
    expect(dndColumnPreview).toBeInTheDocument();
  });

  it('should set editor.previewRef to previewRef', async () => {
    const { getByTestId } = render(<DndPreview />);
    const previewRef = getByTestId('preview-ref');

    await waitFor(() =>
      expect(useEditorRef().previewRef).toEqual({ current: previewRef })
    );
  });
});
