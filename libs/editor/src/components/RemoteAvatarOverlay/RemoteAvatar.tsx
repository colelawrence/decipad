/* eslint-disable no-underscore-dangle */
import { MyValue, useTEditorRef } from '@decipad/editor-types';
import { OpaqueColor, RemoteAvatar as UIRemoteAvatar } from '@decipad/ui';
import { Session } from 'next-auth';
import { FC, RefObject } from 'react';
import { Range } from 'slate';
import { getNodeEntries, isElement, toDOMNode } from '@udecode/plate';
import {
  isPotentiallyWideElement,
  isTopLevelBlock,
} from '@decipad/editor-utils';

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

  return (
    (user?.name && (
      <UIRemoteAvatar
        name={user.name}
        email={user.email ?? undefined}
        top={
          verticallyCenterOnBlock
            ? y - containerVerticalDisplacement + height / 2
            : y - containerVerticalDisplacement + MIN_VERTICAL_DISPLACEMENT
        }
        left={width}
        backgroundColor={cursor.data.style?._backgroundColor}
      />
    )) ||
    null
  );
};
