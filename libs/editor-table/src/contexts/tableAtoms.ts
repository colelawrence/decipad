import { atom } from 'jotai';
import { DropLineDirection } from '@udecode/plate';

export const trScope = Symbol('tr');
export const dropLineAtom = atom<DropLineDirection>('');
