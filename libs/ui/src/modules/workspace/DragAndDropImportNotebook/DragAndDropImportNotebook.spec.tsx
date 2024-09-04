import { it, expect, vi } from 'vitest';
import stringify from 'json-stringify-safe';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { mockConsoleWarn } from '@decipad/testutils';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DragAndDropImportNotebook } from './DragAndDropImportNotebook';
import { noop } from '@decipad/utils';

mockConsoleWarn();

const textDragEventProps = (text: string) => {
  return {
    dataTransfer: {
      types: ['Text'],
      files: [],
      getData: () => text,
      items:
        new (class DataTransferItemListImpl extends Array<DataTransferItem> {
          item(index: number) {
            return this[index];
          }
        })(
          new (class DataTransferItemImpl implements DataTransferItem {
            kind = 'string';
            type = 'text/plain';
            getAsFile(): never {
              throw new Error('Sir this is a string');
            }
            getAsString() {
              return text;
            }
            webkitGetAsEntry(): FileSystemEntry | null {
              throw new Error("This ain't webkit");
            }
          })()
        ),
    },
  };
};

const fileDragEventProps = (files: File[]) => {
  return {
    dataTransfer: {
      types: ['Files'],
      files,
      items:
        new (class DataTransferItemListImpl extends Array<DataTransferItem> {
          item(index: number) {
            return this[index];
          }
        })(
          ...files.map(
            (file) =>
              new (class DataTransferItemImpl implements DataTransferItem {
                kind = 'file';
                type = file.type;
                getAsFile() {
                  return file;
                }
                getAsString() {
                  throw new Error('Sir this is a file');
                }
                webkitGetAsEntry(): FileSystemEntry | null {
                  throw new Error("This ain't webkit");
                }
              })()
          )
        ),
    },
  };
};
const validFile = new File(['43'], 'notebook.json', {
  type: 'application/json',
});
const textFile = new File(['42'], 'notebook.txt', { type: 'text/plain' });
const tooLargeFile = new File(
  [stringify('x'.repeat(20_000_001))],
  'notebook.json',
  { type: 'application/json' }
);

it('renders the children', () => {
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <DragAndDropImportNotebook onImport={noop}>
        child here
      </DragAndDropImportNotebook>
    </DndProvider>
  );
  expect(getByText('child here')).toBeVisible();
});

it('does not show a drop effect when dragging only a text file over', () => {
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <DragAndDropImportNotebook onImport={noop}>
        drop here
      </DragAndDropImportNotebook>
    </DndProvider>
  );

  const dropElement = getByText('drop here');
  const normalBackgroundColor = findParentWithStyle(
    dropElement,
    'backgroundColor'
  )?.backgroundColor;

  fireEvent.dragEnter(dropElement, fileDragEventProps([textFile]));
  fireEvent.dragOver(dropElement, fileDragEventProps([textFile]));
  const dragHoverBackgroundColor = findParentWithStyle(
    dropElement,
    'backgroundColor'
  )?.backgroundColor;

  fireEvent.drop(dropElement, fileDragEventProps([textFile]));

  expect(dragHoverBackgroundColor).toEqual(normalBackgroundColor);
});

it('does not show a drop effect when dragging only a non-file item over', () => {
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <DragAndDropImportNotebook onImport={noop}>
        drop here
      </DragAndDropImportNotebook>
    </DndProvider>
  );

  const dropElement = getByText('drop here');
  const normalBackgroundColor = findParentWithStyle(
    dropElement,
    'backgroundColor'
  )?.backgroundColor;

  fireEvent.dragEnter(dropElement, textDragEventProps('text'));
  fireEvent.dragOver(dropElement, textDragEventProps('text'));
  const dragHoverBackgroundColor = findParentWithStyle(
    dropElement,
    'backgroundColor'
  )?.backgroundColor;

  fireEvent.drop(dropElement, textDragEventProps('text'));

  expect(dragHoverBackgroundColor).toEqual(normalBackgroundColor);
});

it('does not show a drop effect when dragging only a file that is too large over', () => {
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <DragAndDropImportNotebook onImport={noop}>
        drop here
      </DragAndDropImportNotebook>
    </DndProvider>
  );

  const dropElement = getByText('drop here');
  const files = [tooLargeFile];
  const normalBackgroundColor = findParentWithStyle(
    dropElement,
    'backgroundColor'
  )?.backgroundColor;

  fireEvent.dragEnter(dropElement, fileDragEventProps(files));
  fireEvent.dragOver(dropElement, fileDragEventProps(files));
  const dragHoverBackgroundColor = findParentWithStyle(
    dropElement,
    'backgroundColor'
  )?.backgroundColor;

  fireEvent.drop(dropElement, fileDragEventProps(files));

  expect(dragHoverBackgroundColor).toEqual(normalBackgroundColor);
});

it('emits an import event when dropping for only the acceptable file', async () => {
  const handleImport = vi.fn();
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <DragAndDropImportNotebook onImport={handleImport}>
        drop here
      </DragAndDropImportNotebook>
    </DndProvider>
  );

  const dropElement = getByText('drop here');
  const files = [textFile, tooLargeFile, validFile];
  fireEvent.dragEnter(dropElement, fileDragEventProps(files));
  fireEvent.dragOver(dropElement, fileDragEventProps(files));
  fireEvent.drop(dropElement, fileDragEventProps(files));

  await waitFor(() => {
    expect(handleImport).toHaveBeenCalledTimes(1);
    expect(handleImport).toHaveBeenCalledWith(
      Buffer.from('43').toString('base64')
    );
  });
});
