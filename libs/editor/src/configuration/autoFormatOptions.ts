import {
  AutoformatRule,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_DEFAULT,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  getParent,
  getPlatePluginType,
  insertEmptyCodeBlock,
  isElement,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_UNDERLINE,
  SPEditor,
  TEditor,
  toggleList,
  unwrapList,
  WithAutoformatOptions,
} from '@udecode/plate';

const preFormat = (editor: SPEditor): void => unwrapList(editor);
const query = (editor: TEditor): boolean => {
  if (editor.selection) {
    const parentEntry = getParent(editor, editor.selection);
    if (!parentEntry) return false;

    const [node] = parentEntry;

    if (isElement(node) && node.type === ELEMENT_PARAGRAPH) return true;
    return false;
  }
  return true;
};

type Modify<T, R> = Omit<T, keyof R> & R;

type Rule = Modify<
  AutoformatRule,
  {
    preFormat?: (editor: SPEditor) => void;
    format?: (editor: SPEditor) => void;
  }
>;

type AutoFormatOptions = Modify<WithAutoformatOptions, { rules: Rule[] }>;

export const optionsAutoformat: AutoFormatOptions = {
  rules: [
    {
      type: ELEMENT_H2,
      markup: '##',
      preFormat,
    },
    {
      type: ELEMENT_H3,
      markup: '###',
      preFormat,
    },
    {
      type: ELEMENT_BLOCKQUOTE,
      markup: ['>'],
      preFormat,
    },
    {
      type: MARK_BOLD,
      between: ['**', '**'],
      mode: 'inline',
      insertTrigger: true,
      query,
    },
    {
      type: MARK_BOLD,
      between: ['__', '__'],
      mode: 'inline',
      insertTrigger: true,
      query,
    },
    {
      type: MARK_ITALIC,
      between: ['*', '*'],
      mode: 'inline',
      insertTrigger: true,
      query,
    },
    {
      type: MARK_UNDERLINE,
      between: ['_', '_'],
      mode: 'inline',
      insertTrigger: true,
      query,
    },
    {
      type: MARK_CODE,
      between: ['`', '`'],
      mode: 'inline',
      insertTrigger: true,
      query,
    },
    {
      type: ELEMENT_CODE_BLOCK,
      markup: '``',
      trigger: '`',
      triggerAtBlockStart: false,
      preFormat,
      format: (editor: SPEditor): void => {
        insertEmptyCodeBlock(editor, {
          defaultType: getPlatePluginType(editor, ELEMENT_DEFAULT),
          insertNodesOptions: { select: true },
        });
      },
    },
    {
      type: ELEMENT_LI,
      markup: ['*', '-'],
      preFormat,
      format: (editor: TEditor): void => {
        toggleList(editor as SPEditor, { type: ELEMENT_UL });
      },
    },
  ],
};
