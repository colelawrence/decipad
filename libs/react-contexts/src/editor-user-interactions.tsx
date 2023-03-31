import { ImportElementSource } from '@decipad/editor-types';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface PastedLinkUserInteraction {
  type: 'pasted-link';
  url: string;
  source: ImportElementSource | undefined;
  blockId: string;
}
export interface ConsumedUserInteraction {
  type: 'consumed';
}
export type UserInteraction =
  | ConsumedUserInteraction
  | PastedLinkUserInteraction;
export type UserInteractionType = UserInteraction['type'];

export type UserInteractionSubject = Subject<UserInteraction>;

export const EditorUserInteractionsContext =
  createContext<UserInteractionSubject>(new Subject<UserInteraction>());

export const EditorUserInteractionsProvider: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const [userInteraction] = useState(() => new Subject<UserInteraction>());
  return (
    <EditorUserInteractionsContext.Provider value={userInteraction}>
      {children}
    </EditorUserInteractionsContext.Provider>
  );
};

export const useEditorUserInteractionsContext = (): UserInteractionSubject =>
  useContext(EditorUserInteractionsContext);

export const useEditorUserInteractions = (
  _filterTypes: UserInteractionType | Array<UserInteractionType>
): Observable<UserInteraction | null> => {
  const obs = useEditorUserInteractionsContext();
  const filterTypes = useMemo(
    () => (Array.isArray(_filterTypes) ? _filterTypes : [_filterTypes]),
    [_filterTypes]
  );

  const filterTypesFn = useCallback(
    (i: UserInteraction | null) => i === null || filterTypes.includes(i.type),
    [filterTypes]
  );
  return obs.pipe(
    map((i) => (i?.type === 'consumed' ? null : i)),
    filter(filterTypesFn)
  );
};

export function isInteractionOfType<Type extends UserInteractionType>(
  interaction: UserInteraction | null | undefined,
  type: Type
): interaction is Extract<UserInteraction, { type: Type }> {
  return interaction != null && interaction.type === type;
}
