import { DocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import { Notebook } from '@decipad/notebook';
import { notebooks, useRouteParams } from '@decipad/routing';
import {
  ComponentProps,
  FC,
  lazy,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  useGetNotebookByIdQuery,
  useRenameNotebookMutation,
  useUpdateNotebookIconMutation,
} from '../../graphql';
import { ErrorPage, Frame } from '../../meta';
import { parseIconColorFromIdentifier } from '../../utils/parseIconColorFromIdentifier';

const loadTopbar = () =>
  import(/* webpackChunkName: "editor-topbar" */ './Topbar');
const Topbar = lazy(loadTopbar);

const loadEditorIcon = () =>
  import(/* webpackChunkName: "editor-icon" */ './EditorIcon');
const EditorIcon = lazy(loadEditorIcon);

type Icon = ComponentProps<typeof EditorIcon>['icon'];
type IconColor = ComponentProps<typeof EditorIcon>['color'];

const NotebookPage: FC = () => {
  const [editor, setEditor] = useState<MyEditor | undefined>();
  const [docsync, setDocsync] = useState<DocSyncEditor | undefined>();

  const {
    notebook: { id: notebookId },
    secret,
  } = useRouteParams(notebooks({}).notebook);

  const [result] = useGetNotebookByIdQuery({ variables: { id: notebookId } });

  const { data: notebookData, error: notebookError } = result;
  const notebook = notebookData?.getPadById;

  const isReadOnly = notebook?.myPermissionType === 'READ';

  const [icon, setIcon] = useState<Icon>('Rocket');
  const [iconColor, setIconColor] = useState<IconColor>('Catskill');

  const [, renameNotebook] = useRenameNotebookMutation();
  const [, updateNotebookIcon] = useUpdateNotebookIconMutation();

  const handleIconChange = useCallback(
    (newIcon: string) => {
      updateNotebookIcon({
        id: notebookId,
        icon: newIcon,
      });
    },
    [notebookId, updateNotebookIcon]
  );

  const handleIconColorChange = useCallback(
    (newIconColor: string) => {
      setIconColor(newIconColor as IconColor);
      updateNotebookIcon({
        id: notebookId,
        icon: `${icon}-${newIconColor}`,
      });
    },
    [icon, notebookId, updateNotebookIcon]
  );

  // Set the share toggle button to be active if the notebook has secrets
  useEffect(() => {
    const { newIcon, newIconColor, ok } = parseIconColorFromIdentifier(
      notebook?.icon
    );

    if (ok && newIcon && newIconColor) {
      setIcon(newIcon as Icon);
      setIconColor(newIconColor as IconColor);
    }
  }, [notebook]);

  if (notebookError) {
    if (/no such/i.test(notebookError?.message))
      return <ErrorPage Heading="h1" wellKnown="404" />;
    throw notebookError;
  }
  if (!notebook) {
    throw new Error('Missing notebook');
  }

  // TODO lazy load Notebook
  return (
    <Frame Heading="h1" title={notebook.name}>
      <Notebook
        notebookTitle={notebook.name}
        onNotebookTitleChange={(newName) => {
          renameNotebook({
            id: notebook.id,
            name: newName,
          });
        }}
        notebookId={notebookId}
        readOnly={isReadOnly}
        secret={secret}
        onEditor={setEditor}
        onDocsync={setDocsync}
        icon={
          <EditorIcon
            color={iconColor}
            icon={icon}
            onChangeIcon={(newIcon) => {
              setIcon(newIcon as Icon);
              handleIconChange(`${newIcon}-${iconColor}`);
            }}
            onChangeColor={handleIconColorChange}
          />
        }
        topbar={
          <Frame Heading="h1" title={null}>
            <Topbar notebookId={notebookId} docsync={docsync} editor={editor} />
          </Frame>
        }
      />
    </Frame>
  );
};

export default NotebookPage;
