import {
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_SPOILER,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  MyAutoformatRule,
} from '@decipad/editor-types';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

export const autoformatMarks: MyAutoformatRule[] = [
  {
    mode: 'mark',
    type: [MARK_BOLD, MARK_ITALIC],
    match: '***',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_ITALIC],
    match: '__*',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD],
    match: '__**',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
    match: '___***',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: MARK_BOLD,
    match: '**',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: MARK_UNDERLINE,
    match: '__',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '*',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '_',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: MARK_STRIKETHROUGH,
    match: '~~',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: MARK_CODE,
    match: '`',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: MARK_HIGHLIGHT,
    match: '==',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'mark',
    type: MARK_SPOILER,
    match: '||',
    query: doesSelectionAllowTextStyling,
  },
];
