import {
  AutoformatRule,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate';
import { isSelectionInParagraph } from './isSelectionInParagraph';

export const autoformatMarks: AutoformatRule[] = [
  {
    mode: 'mark',
    type: [MARK_BOLD, MARK_ITALIC],
    match: '***',
    query: isSelectionInParagraph,
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_ITALIC],
    match: '__*',
    query: isSelectionInParagraph,
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD],
    match: '__**',
    query: isSelectionInParagraph,
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
    match: '___***',
    query: isSelectionInParagraph,
  },
  {
    mode: 'mark',
    type: MARK_BOLD,
    match: '**',
    query: isSelectionInParagraph,
  },
  {
    mode: 'mark',
    type: MARK_UNDERLINE,
    match: '__',
    query: isSelectionInParagraph,
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '*',
    query: isSelectionInParagraph,
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '_',
    query: isSelectionInParagraph,
  },
  {
    mode: 'mark',
    type: MARK_STRIKETHROUGH,
    match: '~~',
    query: isSelectionInParagraph,
  },
  {
    mode: 'mark',
    type: MARK_CODE,
    match: '`',
    query: isSelectionInParagraph,
  },
];
