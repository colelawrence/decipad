import {
  ELEMENT_IMAGE,
  ImageElement,
  MyAutoformatRule,
  MyEditor,
} from '@decipad/editor-types';
import {
  insertImageBelow,
  requireCollapsedSelection,
} from '@decipad/editor-utils';
import { deleteText, getEditorString, isText, wrapNodes } from '@udecode/plate';
import { allPass } from 'ramda';
import { BasePoint } from 'slate';
import { getTrailingImage } from '../../utils/image';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

const TRIGGER = ')';

const getTextBeforeCursorWithTrigger = (
  editor: MyEditor,
  cursor: BasePoint
) => {
  return (
    getEditorString(editor, {
      anchor: { path: cursor.path, offset: 0 },
      focus: { path: cursor.path, offset: cursor.offset },
    }) + TRIGGER
  );
};

const doesTriggerCompleteImage = (editor: MyEditor) => {
  return (
    getTrailingImage(
      getTextBeforeCursorWithTrigger(editor, requireCollapsedSelection(editor))
    ) !== null
  );
};

const convertPrecedingTextWithTriggerToImage = (editor: MyEditor): void => {
  const cursor = requireCollapsedSelection(editor);
  const image = getTrailingImage(
    getTextBeforeCursorWithTrigger(editor, cursor)
  );

  if (image === null) {
    throw new Error(
      'Trigger does not complete a image given the preceding text. Check doesTriggerCompleteImage first.'
    );
  }

  const { path } = cursor;
  wrapNodes(
    editor,
    {
      type: ELEMENT_IMAGE,
      url: image.url,
      children: [image.alt],
    } as unknown as ImageElement,
    {
      at: {
        anchor: { path, offset: image.startOffset },
        focus: { path, offset: cursor.offset },
      },
      split: true,
      match: isText,
    }
  );

  deleteText(editor, { unit: 'character', distance: image.startOffset });
  insertImageBelow(editor, path, image.url, image.alt);
};

export const autoformatImages: MyAutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_IMAGE,
    triggerAtBlockStart: false,
    match: TRIGGER,
    query: allPass([doesSelectionAllowTextStyling, doesTriggerCompleteImage]),
    format: convertPrecedingTextWithTriggerToImage,
  },
];
