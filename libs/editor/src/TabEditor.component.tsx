import { useTabs } from '@decipad/editor-hooks';
import type { MinimalRootEditorWithEventsAndTabsAndUndoAndFiltersAndTitleEditor } from '@decipad/editor-types';
import type { TabEditorContextValue } from '@decipad/react-contexts';
import {
  EditorIdContext,
  TabEditorContext,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { captureException } from '@decipad/remote-computer';
import { useNotebookRoute } from '@decipad/routing';
import {
  Button,
  EditorPlaceholder,
  cssVar,
  cssVarHex,
  p13Medium,
  p14Bold,
  transparencyHex,
} from '@decipad/ui';
import styled from '@emotion/styled';
import { slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import type { ComponentProps, FC, PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';
import { useIntercom } from 'react-use-intercom';
import { withReact } from 'slate-react';
import { Editor } from './Editor.component';
import { TitleEditor } from './TitleEditor.component';
import { useRecoverNotebook } from './hooks';
import { useUndo } from './hooks/useUndo';

type TabEditorComponentProps = Omit<
  ComponentProps<typeof Editor>,
  'editor' | 'tabIndex' | 'titleEditor'
> & {
  controller: MinimalRootEditorWithEventsAndTabsAndUndoAndFiltersAndTitleEditor;
};

/**
 * We should initialize all tab editors first of all.
 * and then render them instead of doing this here.
 */

export const TabEditorComponent: FC<
  PropsWithChildren<TabEditorComponentProps>
> = ({ children, controller, readOnly, notebookId, workspaceId, loaded }) => {
  const { tabId } = useNotebookRoute();
  const tabs = useTabs(readOnly);

  useUndo(controller);
  const [showRecovery, unsetTimer] = useRecoverNotebook();

  const tab = useMemo(() => {
    const selectedTab = tabs.find((t) => t.id === tabId);

    if (selectedTab) {
      return selectedTab;
    }

    return tabs.at(0);
  }, [tabId, tabs]);

  const titleEditor = useMemo(
    () => withReact(controller.getTitleEditor()),
    [controller]
  );

  const tabEditorContextValue: TabEditorContextValue = useMemo(
    () => ({
      tabIndex: tab ? tabs.findIndex((t) => t.id === tab.id) : -1,
    }),
    [tab, tabs]
  );

  if (!tab) {
    if (showRecovery) {
      if (readOnly) {
        throw new Error('Readonly user, notebook is broken.');
      }
      return <InfiniteLoadingWarning />;
    }
    return <EditorPlaceholder />;
  }

  unsetTimer();

  const subEditor = controller.getTabEditor(tab.id);

  return (
    <EditorIdContext.Provider value={notebookId}>
      <TabEditorContext.Provider value={tabEditorContextValue}>
        <Editor
          key={tab.id}
          notebookId={notebookId}
          workspaceId={workspaceId}
          readOnly={readOnly}
          loaded={loaded}
          editor={subEditor}
          titleEditor={
            <TitleEditor
              tab={tab.id}
              editor={titleEditor}
              initialValue={titleEditor.children}
              readOnly={readOnly}
              onUndo={controller.undo}
              onRedo={controller.redo}
            />
          }
          children={children}
        />
      </TabEditorContext.Provider>
    </EditorIdContext.Provider>
  );
};

const InfiniteLoadingWarning: FC = () => {
  const { show, showNewMessage } = useIntercom();
  const [setCanEdit] = useNotebookMetaData((s) => [s.setCanEdit]);

  useEffect(() => {
    captureException(
      new Error('Infinite notebook loading, users notebook has no content')
    );
    setCanEdit(false);
  }, [setCanEdit]);

  return (
    <>
      <EditorAndTabsOverlay />
      <LoadingDiv>
        <div>
          <p css={p14Bold}>Sorry, we think your notebook might be broken.</p>
          <p css={p13Medium}>
            Don't worry, we'll do our best to help you recover. Please contact
            us on any of the following:
          </p>
          <section>
            <Button
              type="primary"
              onClick={() => {
                show();
                showNewMessage();
              }}
            >
              Contact Live Support
            </Button>
            <Button type="primary" href="http://discord.gg/decipad">
              Join our Discord
            </Button>
          </section>
          <p css={[p13Medium, { marginTop: '4px' }]}>
            Or email us at:{' '}
            <a href="mailto:support@decipad.com">support@decipad.com</a>
          </p>
        </div>
      </LoadingDiv>
    </>
  );
};

const LoadingDiv = styled.div({
  width: '100%',
  // so we can be above the editor.
  position: 'absolute',
  left: 0,
  display: 'flex',
  justifyContent: 'center',
  zIndex: 200,
  div: {
    backgroundColor: cssVar('backgroundHeavy'),
    marginTop: '24px',
    padding: '8px 12px',
    width: '100%',
    maxWidth: `${slimBlockWidth}px`,
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    section: {
      display: 'flex',
      gap: '8px',
      justifyItems: 'space-between',
      alignItems: 'center',
    },
  },
});

const EditorAndTabsOverlay = styled.div({
  width: '100%',
  height: '100%',
  backgroundColor: transparencyHex(cssVarHex('backgroundAccent'), 0.5),
  position: 'absolute',
  zIndex: 100,
  top: 0,
  left: 0,
});
