import { atom } from 'jotai';
import { DropLineDirection } from '@udecode/plate';

export const trScope = Symbol('tr');

// Drop line direction for rows (horizontal)
export const dropLineAtom = atom<DropLineDirection>('');
