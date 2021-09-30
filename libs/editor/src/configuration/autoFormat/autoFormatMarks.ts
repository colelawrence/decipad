import {
  AutoformatRule,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate';
import { queryMark } from './utils/queryMark';

export const autoformatMarks: AutoformatRule[] = [
  {
    mode: 'mark',
    type: [MARK_BOLD, MARK_ITALIC],
    match: '***',
    query: queryMark,
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_ITALIC],
    match: '__*',
    query: queryMark,
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD],
    match: '__**',
    query: queryMark,
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
    match: '___***',
    query: queryMark,
  },
  {
    mode: 'mark',
    type: MARK_BOLD,
    match: '**',
    query: queryMark,
  },
  {
    mode: 'mark',
    type: MARK_UNDERLINE,
    match: '__',
    query: queryMark,
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '*',
    query: queryMark,
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '_',
    query: queryMark,
  },
  {
    mode: 'mark',
    type: MARK_STRIKETHROUGH,
    match: '~~',
    query: queryMark,
  },
  {
    mode: 'mark',
    type: MARK_CODE,
    match: '`',
    query: queryMark,
  },
];
