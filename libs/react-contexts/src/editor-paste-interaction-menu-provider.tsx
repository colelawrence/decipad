import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ImportElementSource } from '@decipad/editor-types';
import {
  useEditorUserInteractions,
  UserInteraction,
} from './editor-user-interactions';

export interface EditorPasteInteractionMenuContextValue {
  showInteractionMenu: boolean;
  blockId?: string;
  source?: ImportElementSource;
  url?: string;
}

export const EditorPasteInteractionMenuContext =
  createContext<EditorPasteInteractionMenuContextValue>({
    showInteractionMenu: false,
  });

export const EditorPasteInteractionMenuProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const interaction$ = useEditorUserInteractions('pasted-link');
  const [interaction, setInteraction] = useState<UserInteraction | null>(null);

  useEffect(() => {
    const sub = interaction$.subscribe(setInteraction);
    return () => {
      sub.unsubscribe();
    };
  }, [interaction, interaction$]);

  return (
    <EditorPasteInteractionMenuContext.Provider
      value={useMemo(
        () =>
          interaction?.type === 'pasted-link'
            ? {
                showInteractionMenu: interaction.type === 'pasted-link',
                blockId: interaction.blockId,
                source: interaction.source,
                url: interaction.url,
              }
            : {
                showInteractionMenu: false,
              },
        [interaction]
      )}
    >
      {children}
    </EditorPasteInteractionMenuContext.Provider>
  );
};

export const useEditorPasteInteractionMenuContext = (
  filterBlockId: string
): EditorPasteInteractionMenuContextValue => {
  const context = useContext(EditorPasteInteractionMenuContext);
  if (context.blockId === filterBlockId) {
    return context;
  }
  return {
    ...context,
    showInteractionMenu: false,
  };
};
