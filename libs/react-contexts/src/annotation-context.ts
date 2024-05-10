import {
  type PermissionType,
  type GetNotebookAnnotationsQuery,
} from '@decipad/graphql-client';
import { createContext, useContext } from 'react';

export type AnnotationArray = NonNullable<
  GetNotebookAnnotationsQuery['getAnnotationsByPadId']
>;
type AnnotationsContextValue = {
  setAnnotations: (annotations: AnnotationArray) => void;
  annotations: AnnotationArray | undefined;
  articleRef: React.RefObject<HTMLElement>;
  scenarioId: string | null;
  expandedBlockId: string | null;
  handleExpandedBlockId: (id: string | null) => void;
  permission: PermissionType | null;
};

const AnnotationsContext = createContext<AnnotationsContextValue | null>(null);

export const AnnotationsProvider = AnnotationsContext.Provider;

export const useAnnotations = () => {
  const context = useContext(AnnotationsContext);
  if (!context) {
    throw new Error('useAnnotations must be used within a AnnotationsContext');
  }
  return context;
};
