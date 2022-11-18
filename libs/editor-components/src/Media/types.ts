import { DrawElementDescendant } from '@decipad/editor-types';
import { MutableRefObject } from 'react';

export declare type ExcalidrawImperativeAPI = {
  updateScene: (sceneData: { elements?: ExcalidrawDrawElement[] }) => void;
  readyPromise?: Promise<ExcalidrawImperativeAPI>;
  ready?: true;
};

export declare type ExcalidrawAPIRefValue =
  | ExcalidrawImperativeAPI
  | {
      readyPromise?: Promise<ExcalidrawImperativeAPI>;
      ready?: false;
    };

export type ExcalidrawRef = MutableRefObject<ExcalidrawAPIRefValue>;

export type ExcalidrawDrawElement = Omit<DrawElementDescendant, 'children'>;

type ID = string;

export interface DrawElementsDiff {
  added: Array<DrawElementDescendant>;
  removed: Array<ID>;
  modified: Array<Partial<DrawElementDescendant> & { id: string }>;
}
