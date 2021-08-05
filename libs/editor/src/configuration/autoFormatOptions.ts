import {
  AutoformatRule,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_DEFAULT,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  getParent,
  getPlatePluginType,
  insertEmptyCodeBlock,
  isElement,
  isType,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  SPEditor,
  toggleList,
  unwrapList,
  WithAutoformatOptions,
} from '@udecode/plate';

const preFormat = (editor: SPEditor): void => unwrapList(editor);

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
      type: ELEMENT_LI,
      markup: ['*', '-'],
      preFormat,
      format: (editor: SPEditor): void => {
        if (editor.selection) {
          const parentEntry = getParent(editor, editor.selection);
          if (!parentEntry) return;
          const [node] = parentEntry;
          if (
            isElement(node) &&
            !isType(editor, node, ELEMENT_CODE_BLOCK) &&
            !isType(editor, node, ELEMENT_CODE_LINE)
          ) {
            toggleList(editor, {
              type: ELEMENT_UL,
            });
          }
        }
      },
    },
    {
      type: ELEMENT_LI,
      markup: ['1.', '1)'],
      preFormat,
      format: (editor: SPEditor): void => {
        if (editor.selection) {
          const parentEntry = getParent(editor, editor.selection);
          if (!parentEntry) return;
          const [node] = parentEntry;
          if (
            isElement(node) &&
            !isType(editor, node, ELEMENT_CODE_BLOCK) &&
            !isType(editor, node, ELEMENT_CODE_LINE)
          ) {
            toggleList(editor, {
              type: ELEMENT_OL,
            });
          }
        }
      },
    },
    {
      type: ELEMENT_TODO_LI,
      markup: ['[]'],
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
    },
    {
      type: MARK_BOLD,
      between: ['__', '__'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: MARK_ITALIC,
      between: ['*', '*'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: MARK_UNDERLINE,
      between: ['_', '_'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: MARK_CODE,
      between: ['`', '`'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: MARK_STRIKETHROUGH,
      between: ['~~', '~~'],
      mode: 'inline',
      insertTrigger: true,
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
  ],
};
