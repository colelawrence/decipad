import { useClientEvents } from '@decipad/client-events';
import { useComputer, useFilteredTabs } from '@decipad/editor-hooks';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_PLOT,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  MyElement,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  clone,
  forceDownload,
  isColumnableKind,
  openSlashMenu,
  requirePathBelowBlock,
  wrapIntoLayout,
} from '@decipad/editor-utils';
import {
  useAnnotations,
  useNotebookWithIdState,
} from '@decipad/notebook-state';
import { onMoveToTab as moveToTab } from '@decipad/notebook-tabs';
import {
  useInsideLayoutContext,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import {
  componentCssVars,
  cssVar,
  DeleteWithDepsMenuItem,
  MenuItem,
  MenuList,
  p12Medium,
  p12Regular,
  Tooltip,
  TriggerMenuItem,
  useEventNoEffect,
} from '@decipad/ui';
import { assert } from '@decipad/utils';
import { css } from '@emotion/react';
import * as UserIcons from 'libs/ui/src/icons/user-icons';
import {
  findNode,
  findNodePath,
  getNode,
  getNodeString,
  insertElements,
  removeNodes,
  setNodes,
} from '@udecode/plate-common';
import { blockSelectionSelectors } from '@udecode/plate-selection';
import {
  Add,
  Chat,
  Download,
  Duplicate,
  FullWidthLayout,
  Hide,
  Link,
  Move,
  Show,
  Trash,
  DragHandle as UIDragHandle,
} from 'libs/ui/src/icons';
import { BlockDragHandle } from 'libs/ui/src/modules/editor/BlockDragHandle/BlockDragHandle';
import { useState } from 'react';
import { Path } from 'slate';
import copyToClipboard from 'copy-to-clipboard';
import { Computer, IdentifiedResult } from '@decipad/computer-interfaces';
import { useToast } from '@decipad/toast';
import { materializeResult, Result } from '@decipad/remote-computer';
import { exportCsv } from '@decipad/export';
import { handleExportSVGUsingHtml2Canvas } from './download-chart';
import { ConnectDragSource } from 'react-dnd';

const handleButtonStyle = css({
  borderRadius: '6px',
  background: cssVar('backgroundMain'),

  ':hover': {
    background: cssVar('backgroundDefault'),
  },
});

const plusStyle = css(handleButtonStyle, {
  gridArea: 'plus',
  cursor: 'pointer',
  color: cssVar('iconColorHeavy'),
  height: '20px',
  padding: '1px',
  width: '20px',

  '> svg': {
    height: '100%',
  },
});

const plusButtonTextStyle = css({
  whiteSpace: 'nowrap',
  textAlign: 'center',
});

const toolTipTitle = css(p12Medium, {
  textAlign: 'center',
  color: componentCssVars('TooltipText'),
});

const tooltipContent = css(p12Regular, {
  marginTop: '6px',
  color: componentCssVars('TooltipTextSecondary'),
  textAlign: 'center',
});

const getSelection = (): [boolean, Set<string>] => {
  const selected = blockSelectionSelectors.selectedIds() as Set<string>;
  return [selected.size > 1, selected];
};

const withMultipleSelectionAction = (
  editor: MyEditor,
  element: MyElement,
  action: (path: Path) => void
): (() => void) => {
  return () => {
    const [isMultipleSelection, blockSelectedIds] = getSelection();
    if (!isMultipleSelection) {
      const path = findNodePath(editor, element);
      assert(path != null, 'Path cannot be null here.');

      action(path);
    } else {
      for (const id of blockSelectedIds.values()) {
        const entry = findNode<MyElement>(editor, { match: { id } });
        if (entry == null) continue;

        const [, path] = entry;
        action(path);
      }
    }
  };
};

type DragHandleProps = {
  element: MyElement;

  dragSource?: ConnectDragSource;
};

const ShowHideButton = ({ element }: DragHandleProps) => {
  const event = useClientEvents();
  const editor = useMyEditorRef();

  const onShowHide = withMultipleSelectionAction(editor, element, (path) => {
    event({
      segmentEvent: {
        type: 'action',
        action: `${element.isHidden ? 'show' : 'hide'} block`,
        props: { blockType: element.type },
      },
    });

    setNodes(
      editor,
      { isHidden: !element.isHidden } satisfies Partial<MyElement>,
      { at: path }
    );
  });

  if (element.isHidden) {
    return (
      <MenuItem icon={<Show />} onSelect={onShowHide}>
        Show to reader
      </MenuItem>
    );
  } else {
    return (
      <MenuItem icon={<Hide />} onSelect={onShowHide}>
        Hide from reader
      </MenuItem>
    );
  }
};

type BasicDeleteButtonProps = { onDelete: () => void };

type DeleteButtonWithDepsProps = DragHandleProps & BasicDeleteButtonProps;

const DeleteButtonWithDeps = ({
  element,
  onDelete,
}: DeleteButtonWithDepsProps) => {
  assert(isCalculationType(element));

  const computer = useComputer();
  const blocksInUse = computer.blocksInUse$.use(element.id!);

  if (blocksInUse.length === 0) {
    return <BasicDeleteButton onDelete={onDelete} />;
  } else {
    return (
      <DeleteWithDepsMenuItem onSelect={onDelete} blockInfo={blocksInUse[0]} />
    );
  }
};

const BasicDeleteButton = ({ onDelete }: BasicDeleteButtonProps) => {
  return (
    <MenuItem icon={<Trash />} onSelect={onDelete}>
      Delete
    </MenuItem>
  );
};

const DeleteButton = ({ element }: DragHandleProps) => {
  const event = useClientEvents();
  const editor = useMyEditorRef();

  const onDelete = withMultipleSelectionAction(editor, element, (path) => {
    event({
      segmentEvent: {
        type: 'action',
        action: 'block deleted',
        props: { blockType: element.type },
      },
    });

    removeNodes(editor, { at: path });
  });

  if (isCalculationType(element)) {
    return <DeleteButtonWithDeps element={element} onDelete={onDelete} />;
  } else {
    return <BasicDeleteButton onDelete={onDelete} />;
  }
};

const AnnotationButton = ({ element }: DragHandleProps) => {
  const setSidebar = useNotebookMetaData((s) => s.setSidebar);
  const { handleExpandedBlockId } = useAnnotations();

  const onAnnotation = () => {
    setSidebar({ type: 'annotations' });
    handleExpandedBlockId(element.id!);
  };

  return (
    <MenuItem icon={<Chat />} onSelect={onAnnotation}>
      Comment
    </MenuItem>
  );
};

const DuplicateButton = ({ element }: DragHandleProps) => {
  const editor = useMyEditorRef();
  const computer = useComputer();

  const onDuplicate = () => {
    const nodeList: Array<MyElement> = [];
    let largestIndex = 0;

    const duplicateAction = withMultipleSelectionAction(
      editor,
      element,
      (path) => {
        const node = getNode<MyElement>(editor, path);
        assert(
          node != null,
          'You should always find node with the given path.'
        );

        const clonedNode = clone(computer, node);
        nodeList.push(clonedNode);

        const [blockIndex] = path;

        if (blockIndex > largestIndex) {
          largestIndex = blockIndex;
        }
      }
    );

    duplicateAction();
    insertElements(editor, nodeList, {
      at: requirePathBelowBlock(editor, [largestIndex]),
    });
  };

  return (
    <MenuItem
      data-testid="duplicate-block"
      icon={<Duplicate />}
      onSelect={onDuplicate}
    >
      Duplicate
    </MenuItem>
  );
};

const PlusButton = ({ element }: DragHandleProps) => {
  const event = useClientEvents();
  const editor = useMyEditorRef();

  const onClick = useEventNoEffect(() => {
    openSlashMenu(editor, element);
    event({
      segmentEvent: {
        type: 'action',
        action: 'click +',
        props: { blockType: element.type },
      },
    });
  });

  return (
    <Tooltip
      trigger={
        <button
          tabIndex={-1}
          onClick={onClick}
          css={plusStyle}
          data-testid="plus-block-button"
        >
          <Add />
        </button>
      }
      side="bottom"
      hoverOnly
      offset={1}
    >
      <span css={plusButtonTextStyle}>
        <strong>Click</strong> to add block below
      </span>
    </Tooltip>
  );
};

const MoveToTabButton = ({ element }: DragHandleProps) => {
  const tabs = useFilteredTabs();
  const editor = useMyEditorRef();
  const controller = useNotebookWithIdState((s) => s.controller);

  const onMoveToTab = (tabId: string) =>
    withMultipleSelectionAction(editor, element, (path) => {
      assert(controller != null);

      const elementToMove = getNode<MyElement>(editor, path);
      assert(elementToMove != null, 'elementToMove cannot be null here.');

      moveToTab(controller, elementToMove.id!, tabId);
    });

  if (tabs.length >= 1) {
    return (
      <MenuList
        itemTrigger={
          <TriggerMenuItem icon={<Move />}>Move to tab</TriggerMenuItem>
        }
      >
        {tabs.map((t, i) => {
          const TabIcon = UserIcons[t.icon ?? 'FileText'];
          return (
            <MenuItem
              key={t.id}
              icon={<TabIcon />}
              onSelect={() => onMoveToTab(t.id)()}
              testid={`move-to-tab-${i}`}
            >
              <div style={{ minWidth: '132px' }}>{t.name}</div>
            </MenuItem>
          );
        })}
      </MenuList>
    );
  } else {
    return null;
  }
};

const MakeFullScreenButton = ({ element }: DragHandleProps) => {
  const editor = useMyEditorRef();
  const event = useClientEvents();

  const insideLayout = useInsideLayoutContext();

  const showMakeFullWidthButton =
    !insideLayout && isColumnableKind(element.type);

  const onMakeFullWidth = () => {
    const path = findNodePath(editor, element);
    assert(path != null, 'Path cannot be undefined here.');

    wrapIntoLayout(editor, path, 'full');

    event({
      segmentEvent: {
        type: 'action',
        action: 'Toggle Width Button Clicked',
        props: {
          analytics_source: 'frontend',
          button_location: 'block menu',
        },
      },
    });
  };

  if (showMakeFullWidthButton) {
    return (
      <MenuItem icon={<FullWidthLayout />} onSelect={onMakeFullWidth}>
        Full Width
      </MenuItem>
    );
  } else {
    return null;
  }
};

const isCalculationType = (element: MyElement) =>
  element.type === ELEMENT_CODE_LINE ||
  element.type === ELEMENT_TABLE ||
  element.type === ELEMENT_CODE_LINE_V2 ||
  element.type === ELEMENT_VARIABLE_DEF;

const CopyHrefButton = ({ element }: DragHandleProps) => {
  const event = useClientEvents();

  const [isMultipleSelection] = getSelection();

  const onCopyHref = () => {
    const url = new URL(window.location.toString());

    let { pathname } = url;
    const hash = element.id;

    const pathSegments = pathname.split('/');
    if (pathSegments.length > 2) {
      pathSegments.splice(-1, 1);
      pathname = pathSegments.join('/');
    }

    const newUrl = `${url.origin}${pathname}#${hash}`;
    copyToClipboard(newUrl);

    event({
      segmentEvent: {
        type: 'action',
        action: 'copy block href',
        props: { blockType: element.type },
      },
    });
  };

  if (isCalculationType(element) && !isMultipleSelection) {
    return (
      <MenuItem icon={<Link />} onSelect={onCopyHref}>
        <Tooltip trigger={<span>Copy reference link</span>} side="right">
          <div css={{ width: '180px' }}>
            <p css={[toolTipTitle, { textAlign: 'left' }]}>
              Re-use Across Documents
            </p>
            <p css={[tooltipContent, { textAlign: 'left' }]}>
              Share across different documents by generating a reference link.
              Please note, for this feature to work, the original document must
              be set to 'Public'.
            </p>
          </div>
        </Tooltip>
      </MenuItem>
    );
  } else {
    return null;
  }
};

const isValidResult = (
  result: ReturnType<Computer['getBlockIdResult']>
): result is IdentifiedResult => {
  return !(
    !result ||
    result.error ||
    !result.result ||
    (result.result.type.kind !== 'materialized-table' &&
      result.result.type.kind !== 'table')
  );
};

const DownloadCsv = ({ element }: DragHandleProps) => {
  const events = useClientEvents();
  const computer = useComputer();
  const toast = useToast();

  const onDownload = async () => {
    assert(
      element.type === ELEMENT_TABLE,
      'Cannot click this button if element is not downloadable.'
    );

    const tableName = getNodeString(element.children[0].children[0]);
    const result = computer.getBlockIdResult(element.id!);

    if (!isValidResult(result)) {
      toast.error(
        `Cannot download table data${result?.error ? `: ${result.error}` : ''}`
      );
      return;
    }

    const rResult = await materializeResult(result.result);
    if (rResult == null) {
      toast.error('Cannot download table data: no result');
      return;
    }

    const csv = exportCsv(rResult as Result.Result<'materialized-table'>);
    forceDownload(`${tableName}.csv`, new Blob([csv]));
    events({
      segmentEvent: {
        type: 'action',
        action: 'Table CSV Downloaded',
        props: {
          analytics_source: 'frontend',
        },
      },
    });
  };

  if (element.type === ELEMENT_TABLE) {
    return (
      <MenuItem icon={<Download />} onSelect={onDownload}>
        <p>Download as CSV</p>
      </MenuItem>
    );
  } else {
    return null;
  }
};

const DownloadChart = ({ element }: DragHandleProps) => {
  const chartUuid = `chart-${element.id}-${new Date().toLocaleDateString(
    'de-DE'
  )}`;

  const onDownload = handleExportSVGUsingHtml2Canvas(chartUuid);

  if (element.type === ELEMENT_PLOT) {
    return (
      <MenuItem icon={<Download />} onSelect={onDownload}>
        Download chart
      </MenuItem>
    );
  } else {
    return null;
  }
};

type DragHandleButtonProps = DragHandleProps & { isMenuOpen: boolean };

const DragHandleButton = ({ element, isMenuOpen }: DragHandleButtonProps) => {
  const showEyeLabel = Boolean(element.isHidden) && !isMenuOpen;

  if (showEyeLabel) {
    return <Hide />;
  } else {
    return <UIDragHandle />;
  }
};

export const DragHandle = ({ element, dragSource }: DragHandleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const isInsideLayout = useInsideLayoutContext();

  return (
    <BlockDragHandle
      MainButton={<DragHandleButton element={element} isMenuOpen={isOpen} />}
      LeftButton={<PlusButton element={element} />}
      insideLayout={isInsideLayout}
      menuOpen={isOpen}
      onChangeMenuOpen={setIsOpen}
      dragSource={dragSource}
    >
      <ShowHideButton element={element} />
      <DuplicateButton element={element} />
      <CopyHrefButton element={element} />
      <AnnotationButton element={element} />
      <MoveToTabButton element={element} />
      <MakeFullScreenButton element={element} />
      <DownloadCsv element={element} />
      <DownloadChart element={element} />
      <DeleteButton element={element} />
    </BlockDragHandle>
  );
};
