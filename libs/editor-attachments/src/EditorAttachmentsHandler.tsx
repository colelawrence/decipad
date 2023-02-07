import { FC, PropsWithChildren, useCallback, useState } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { produce } from 'immer';
import axios from 'axios';
import { dndStore } from '@udecode/plate-ui-dnd';
import { useToast } from '@decipad/toast';
import { UploadProgressModal } from '@decipad/ui';
import { insertLiveConnection } from '@decipad/editor-components';
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
import { validateItemAndGetFile } from './validateItemAndGetFile';
import { defaultEditorAttachmentsContextValue } from './EditorAttachmentsContext';
import { DropZoneDetector } from './DropZoneDetector';

const uploadProgressWrapperStyles = css({
  zIndex: 3,
});

type EditorAttachmentsHandlerProps = PropsWithChildren<{
  getAttachmentForm: (file: File) => Promise<[URL, FormData, string]>;
  onAttached: (handle: string) => Promise<{ url: URL }>;
}>;

export const EditorAttachmentsHandler: FC<EditorAttachmentsHandlerProps> = ({
  getAttachmentForm,
  onAttached,
  children,
}) => {
  const toast = useToast();
  const computer = useComputer();
  const { editor } = useNotebookState();

  const [attachments, setAttachments] = useState(
    defaultEditorAttachmentsContextValue
  );

  const onAttach = useCallback(
    async (file: File) => {
      if (!editor) {
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
        const [target, form, handle] = await getAttachmentForm(file);
        form.append('file', file);
        await axios.post(target.toString(), form, {
          onUploadProgress: (progressEvent) => {
            setAttachments(
              produce(attachments, (att) => {
                const desc = att.uploading.find((f) => f.file === file);
                if (desc) {
                  desc.progress =
                    (progressEvent.loaded /
                      (progressEvent.total ?? file.size)) *
                    100;
                }
              })
            );
          },
        });
        const { url } = await onAttached(handle);

        setAttachments(
          produce(attachments, (att) => {
            const index = att.uploading.findIndex((f) => f.file === file);
            if (index >= 0) {
              att.uploading.splice(index, 1);
            }
          })
        );

        withoutNormalizing(editor, () => {
          if (!editor.selection || !isCollapsed(editor.selection)) {
            const point = getStartPoint(editor, [editor.children.length - 1]);
            focusEditor(editor, point);
          }

          insertLiveConnection({ computer, editor, url: url.toString() });
        });
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
    [attachments, computer, editor, getAttachmentForm, onAttached, toast]
  );

  const [{ isOver }, connectDropTarget] = useDrop({
    accept: [NativeTypes.FILE],
    drop: (data: DataTransfer) => {
      dndStore.set.isDragging(false);
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
    canDrop: (data: DataTransfer) => {
      const items = data?.items || [];
      return Array.from(items).some((item) => {
        try {
          if (validateItemAndGetFile(item)) {
            return true;
          }
        } catch {
          // do nothing
        }
        return false;
      });
    },
    collect: (monitor: DropTargetMonitor) => {
      return {
        isOver: monitor.isOver(),
      };
    },
  });

  const showUploading = useDelayedTrue(attachments.uploading.length > 0);

  if (process.env.REACT_APP_E2E) {
    return <>{children}</>;
  }

  return (
    <>
      <DropZoneDetector connectDropTarget={connectDropTarget} isOver={isOver} />
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
