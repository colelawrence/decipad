import {
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  ExitBreakPlugin,
  HeadingPlugin,
  HighlightPlugin,
  ItalicPlugin,
  ListPlugin,
  ParagraphPlugin,
  SoftBreakPlugin,
  StrikethroughPlugin,
  TodoListPlugin,
  UnderlinePlugin,
  withAutoformat,
  withList,
  withNodeID,
  withTrailingNode,
} from '@udecode/slate-plugins';
import { nanoid } from 'nanoid';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { autoFormatOptions } from '../options/autoFormatOptions';
import { exitBreakPluginOptions } from '../options/exitBreakOptions';
import { softBreakPluginOptions } from '../options/softBreakOptions';
import { withMentions } from './MentionPlugin/withMentions';
import { SyntaxHighlightingPlugin } from './SyntaxHighlightingPlugin';

export const plugins = [
  ParagraphPlugin(),
  BoldPlugin(),
  ItalicPlugin(),
  UnderlinePlugin(),
  StrikethroughPlugin(),
  HighlightPlugin(),
  HeadingPlugin(),
  CodePlugin({ code: { hotkey: 'mod+shift+e' } }),
  CodeBlockPlugin(),
  ListPlugin(),
  TodoListPlugin({ todo_li: { hotkey: 'mod+shift+l' } }),
  ExitBreakPlugin(exitBreakPluginOptions),
  SoftBreakPlugin(softBreakPluginOptions),
  SyntaxHighlightingPlugin(),
];

export const withPlugins = [
  withReact,
  withHistory,
  withList(),
  withAutoformat(autoFormatOptions),
  withTrailingNode({ type: 'p' }),
  withNodeID({ idCreator: () => nanoid() }),
  withMentions,
] as any[];
