import { DrawElementDescendant } from '@decipad/editor-types';
import { MutableRefObject } from 'react';

export declare type ExcalidrawImperativeAPI = {
  updateScene: (sceneData: { elements?: DrawElementDescendant[] }) => void;
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
