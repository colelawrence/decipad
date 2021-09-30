import { AutoformatBlockRule, SPEditor, unwrapList } from '@udecode/plate';

export const preFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor as SPEditor);
