/* eslint-disable no-underscore-dangle */
import { MyValue, useTEditorRef } from '@decipad/editor-types';
import {
  isPotentiallyWideElement,
  isTopLevelBlock,
} from '@decipad/editor-utils';
import { OpaqueColor, RemoteAvatar as UIRemoteAvatar } from '@decipad/ui';
import { getNodeEntries, isElement, toDOMNode } from '@udecode/plate';
import { Session } from 'next-auth';
import { FC, RefObject } from 'react';
import { Range } from 'slate';

const MIN_VERTICAL_DISPLACEMENT = 50;

interface RemoteAvatarProps {
  cursor: {
    data: Session & {
      style: {
        _backgroundColor: OpaqueColor;
      };
    };
    selection: Range;
  };
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

  const editor = useTEditorRef();

  const entries = Array.from(
    getNodeEntries<MyValue[number]>(editor, {
      at: selection.focus,
      block: true,
      match: isTopLevelBlock,
    })
  );

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
  return (
    (collabName && (
      <UIRemoteAvatar
        name={collabName}
        email={user.email ?? undefined}
        top={
          verticallyCenterOnBlock
            ? y - containerVerticalDisplacement + height / 2
            : y - containerVerticalDisplacement + MIN_VERTICAL_DISPLACEMENT
        }
        left={width}
        cursorColor={cursor.data.style?._backgroundColor}
      />
    )) ||
    null
  );
};
