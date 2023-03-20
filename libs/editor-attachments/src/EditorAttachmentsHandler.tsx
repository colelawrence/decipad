import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { produce } from 'immer';
import axios, { AxiosProgressEvent } from 'axios';
import { useToast } from '@decipad/toast';
import { UploadProgressModal } from '@decipad/ui';
import {
  canDropFile,
  dndStore,
  insertLiveConnection,
  validateItemAndGetFile,
} from '@decipad/editor-components';
import { useComputer } from '@decipad/react-contexts';
import { useNotebookState } from '@decipad/notebook-state';
import {
  focusEditor,
  getStartPoint,
  isCollapsed,
  withoutNormalizing,
} from '@udecode/plate';
import { css } from '@emotion/react';
import { useDelayedTrue } from '@decipad/react-utils';
import { insertImageBelow } from '@decipad/editor-utils';
import { Path } from 'slate';
import { dndStore as plateDndStore } from '@udecode/plate-dnd';
import { defaultEditorAttachmentsContextValue } from './EditorAttachmentsContext';
import { DropZoneDetector } from './DropZoneDetector';

const uploadProgressWrapperStyles = css({
  zIndex: 3,
});

type EditorAttachmentsHandlerProps = PropsWithChildren<{
  notebookId: string;
  getAttachmentForm: (
    file: File
  ) => Promise<undefined | [URL, FormData, string]>;
  onAttached: (handle: string) => Promise<undefined | { url: URL }>;
}>;

export const EditorAttachmentsHandler: FC<EditorAttachmentsHandlerProps> = ({
  notebookId,
  getAttachmentForm,
  onAttached,
  children,
}) => {
  const toast = useToast();
  const computer = useComputer();
  const { editor } = useNotebookState(notebookId);

  const [attachments, setAttachments] = useState(
    defaultEditorAttachmentsContextValue
  );
  const canDropState = dndStore.use.canDrop();

  const onUploadProgress = useCallback(
    (file: File) => (progressEvent: AxiosProgressEvent) => {
      setAttachments(
        produce(attachments, (att) => {
          const desc = att.uploading.find((f) => f.file === file);
          if (desc) {
            desc.progress =
              (progressEvent.loaded / (progressEvent.total ?? file.size)) * 100;
          }
        })
      );
    },
    [attachments]
  );

  const attachGeneric = useCallback(
    async (file: File): Promise<undefined | { url: string }> => {
      const attForm = await getAttachmentForm(file);
      if (!attForm) {
        return;
      }
      const [target, form, handle] = attForm;
      form.append('file', file);
      await axios.post(target.toString(), form, {
        onUploadProgress: onUploadProgress(file),
      });
      const onAttachedResponse = await onAttached(handle);
      if (!onAttachedResponse) {
        return;
      }
      return {
        url: onAttachedResponse.url.toString(),
      };
    },
    [getAttachmentForm, onAttached, onUploadProgress]
  );

  const attachImage = useCallback(
    async (file: File): Promise<{ url: string }> => {
      const targetURL = `/api/pads/${editor?.id}/images`;
      const response = await axios.post(targetURL, file, {
        onUploadProgress: onUploadProgress(file),
      });
      const url = response.data;
      return { url };
    },
    [editor?.id, onUploadProgress]
  );

  const insertAttachment = useCallback(
    (file: File, url: string) => {
      if (!editor) {
        return;
      }
      withoutNormalizing(editor, () => {
        let insertAt: Path;
        if (!editor.selection || !isCollapsed(editor.selection)) {
          const point = getStartPoint(editor, [editor.children.length - 1]);
          focusEditor(editor, point);
          insertAt = point.path;
        } else {
          insertAt = editor.selection.anchor.path;
        }

        if (file.type.startsWith('image/')) {
          insertImageBelow(editor, insertAt, url, file.name);
        } else {
          insertLiveConnection({ computer, editor, url });
        }
      });
    },
    [computer, editor]
  );

  const onAttach = useCallback(
    async (file: File) => {
      if (!editor?.id) {
        return;
      }
      setAttachments(
        produce(attachments, (att) => {
          att.uploading.push({
            file,
            progress: 0,
          });
        })
      );
      try {
        const attachResult = await (file.type.startsWith('image/')
          ? attachImage(file)
          : attachGeneric(file));
        if (attachResult == null) {
          return;
        }
        const { url } = attachResult;

        setAttachments(
          produce(attachments, (att) => {
            const index = att.uploading.findIndex((f) => f.file === file);
            if (index >= 0) {
              att.uploading.splice(index, 1);
            }
          })
        );
        insertAttachment(file, url);
      } catch (err) {
        console.error(err);
        toast('Error uploading file', 'error');
        setAttachments(
          produce(attachments, (att) => {
            const index = att.uploading.findIndex((f) => f.file === file);
            if (index >= 0) {
              att.uploading.splice(index, 1);
            }
          })
        );
      }
    },
    [
      attachGeneric,
      attachImage,
      attachments,
      editor?.id,
      insertAttachment,
      toast,
    ]
  );

  const [{ canDrop, isOver }, connectDropTarget] = useDrop({
    accept: [NativeTypes.FILE],
    drop: (data: DataTransfer) => {
      plateDndStore.set.isDragging(false);
      const items = data?.items || [];
      Array.from(items).forEach(async (item) => {
        // Async fire and forget
        try {
          const file = validateItemAndGetFile(item);
          if (file instanceof File) {
            onAttach(file);
          }
        } catch (err) {
          console.warn('Did not import invalid item', item);
        }
      });
    },
    canDrop: canDropFile,
    collect: (monitor: DropTargetMonitor) => {
      return {
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      };
    },
  });

  useEffect(() => {
    if (!isOver) {
      dndStore.set.canDrop(false);
    }
  }, [canDrop, isOver]);

  const showUploading = useDelayedTrue(attachments.uploading.length > 0);

  if (!editor || editor.isReadOnly || process.env.REACT_APP_E2E) {
    return <>{children}</>;
  }

  return (
    <>
      <DropZoneDetector
        connectDropTarget={connectDropTarget}
        isOver={canDropState}
      />
      {children}
      {showUploading ? (
        <div css={uploadProgressWrapperStyles}>
          <UploadProgressModal
            files={attachments.uploading.map((f) => ({
              name: f.file.name,
              progress: f.progress,
            }))}
          />
        </div>
      ) : null}
    </>
  );
};
