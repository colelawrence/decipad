import type {
  ElementKind,
  MyEditor,
  EditorObserverMessage,
  MyElement,
} from '.';
import type { Observable } from 'rxjs';

export type SpecificObserver<T extends ElementKind> = EditorObserverMessage<
  Extract<MyElement, { type: T }>
>;

export interface ElementObserver {
  OverrideApply: (editor: MyEditor) => void;

  CreateElementObserver: <T extends ElementKind>(
    elementType: T,
    elementId?: string
  ) => Observable<SpecificObserver<T>>;
}
