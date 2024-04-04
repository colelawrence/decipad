/* eslint-disable no-underscore-dangle */
import type { MyValue } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import {
  isPotentiallyWideElement,
  isTopLevelBlock,
} from '@decipad/editor-utils';
import type { UserCursorState } from '@decipad/react-contexts';
import { RemoteAvatar as UIRemoteAvatar } from '@decipad/ui';
import {
  getNodeEntries,
  hasNode,
  isElement,
  toDOMNode,
} from '@udecode/plate-common';
import type { FC, RefObject } from 'react';

const MIN_VERTICAL_DISPLACEMENT = 50;

interface RemoteAvatarProps {
  cursor: UserCursorState;
  containerRef: RefObject<HTMLElement>;
}

export const RemoteAvatar: FC<RemoteAvatarProps> = ({
  cursor,
  containerRef,
}) => {
  const {
    data: { user },
    selection,
  } = cursor;

  const editor = useMyEditorRef();

  const entries =
    selection && hasNode(editor, selection.focus.path)
      ? Array.from(
          getNodeEntries<MyValue[number]>(editor, {
            at: selection.focus,
            block: true,
            match: isTopLevelBlock,
          })
        )
      : [];

  if (!entries.length) {
    return null;
  }
  const [[block]] = entries;
  const node = toDOMNode(editor, block);
  if (!node) {
    return null;
  }
  const { y: containerVerticalDisplacement = 0 } =
    containerRef.current?.getBoundingClientRect() ?? {};
  const { y, height, width } = node.getBoundingClientRect();
  const verticallyCenterOnBlock =
    !isElement(block) || !isPotentiallyWideElement(block);

  const collabName = user?.name || user?.email;
  const { color } = cursor.data;
  return (
    (collabName && color && (
      <UIRemoteAvatar
        name={collabName}
        image={user.image ?? undefined}
        top={
          verticallyCenterOnBlock
            ? y - containerVerticalDisplacement + height / 2
            : y - containerVerticalDisplacement + MIN_VERTICAL_DISPLACEMENT
        }
        left={width}
        cursorColor={color}
      />
    )) ||
    null
  );
};
