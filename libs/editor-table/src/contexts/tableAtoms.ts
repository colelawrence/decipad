import { atom } from 'jotai';
import { DropLineDirection } from '@udecode/plate';
import { TableHeaderElement } from '@decipad/editor-types';
import { ColumnDndDirection } from '../types';

export type ColumnDropLine = {
  element: TableHeaderElement;
  direction: NonNullable<ColumnDndDirection>;
} | null;

export const trScope = Symbol('tr');

// Drop line direction for rows (horizontal)
export const dropLineAtom = atom<DropLineDirection>('');

// Drop line direction for columns (vertical)
export const columnDropLineAtom = atom<ColumnDropLine>(null);
