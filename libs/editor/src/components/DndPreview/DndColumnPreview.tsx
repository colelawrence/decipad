import type {
  DataViewHeader,
  DragColumnItem,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { ColumnDndPreview as UIColumnDndPreview } from '@decipad/ui';
import type { TNodeEntry } from '@udecode/plate-common';
import { findNode } from '@udecode/plate-common';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';

const previewOpacity = 0.7;

const ColumnPreview = ({
  thEntry,
  style,
}: {
  style: CSSProperties;
  thEntry: TNodeEntry<TableHeaderElement | DataViewHeader>;
}) => {
  const [thElement] = thEntry;

  // table heading?
  let label = thElement.children[0].text;

  // dataview?
  if (!label) {
    label = typeof thElement.label === 'string' ? thElement.label : 'Column'; // or schema is broken...
  }
  return (
    <div
      style={{
        ...style,
        opacity: previewOpacity,
        zIndex: 1,
      }}
    >
      <UIColumnDndPreview label={label} />
    </div>
  );
};

export const DndColumnPreview = (props: {
  item: DragColumnItem;
  style: CSSProperties;
}) => {
  const { item } = props;

  const editor = useMyEditorRef();

  const thEntry = useMemo(
    () =>
      findNode<TableHeaderElement | DataViewHeader>(editor, {
        match: { id: item.id },
        at: [],
      }),
    [editor, item.id]
  );

  if (!thEntry) return null;

  return <ColumnPreview {...props} thEntry={thEntry} />;
};
