/* eslint decipad/css-prop-named-variable: 0 */
import type { BlockDependents } from '@decipad/computer-interfaces';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
  TabElement,
  TopLevelValue,
  useMyEditorRef,
} from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';
import { noop, once } from '@decipad/utils';
import { css } from '@emotion/react';
import { getNode } from '@udecode/plate-common';
import {
  FC,
  HTMLProps,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Path } from 'slate';
import {
  Add,
  Chat,
  Download,
  DragHandle,
  Duplicate,
  FullWidthLayout,
  Hide,
  Link,
  Move,
  Show,
  Sparkles,
  Trash,
} from '../../../icons';
import * as userIcons from '../../../icons/user-icons';
import {
  componentCssVars,
  cssVar,
  p12Medium,
  p12Regular,
} from '../../../primitives';
import {
  DeleteWithDepsMenuItem,
  MenuItem,
  MenuList,
  Tooltip,
  TriggerMenuItem,
} from '../../../shared';
import { editorLayout } from '../../../styles';
import { hideOnPrint } from '../../../styles/editor-layout';
import { useEventNoEffect } from '../../../utils/useEventNoEffect';

const gridStyles = once(() =>
  css({
    display: 'grid',
    gridTemplateAreas: `
      ". plus handle"
      "menu . ."
    `,
    gridTemplateRows: `
      ${editorLayout.gutterHandleHeight()}
      auto
    `,
    gridTemplateColumns: `
      minmax(max-content, 144px)
      ${editorLayout.gutterHandleWidth()}
    `,
    justifyContent: 'end',
  })
);

const handleButtonStyle = css({
  borderRadius: '6px',
  background: cssVar('backgroundMain'),

  ':hover': {
    background: cssVar('backgroundDefault'),
  },
});

const eyeLabelStyles = css(handleButtonStyle, {
  height: '20px',
  width: '20px',
  padding: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '> svg': {
    height: '100%',
  },
});

export const handleStyle = css(handleButtonStyle, {
  gridArea: 'handle',
  cursor: 'grab',
  height: '20px',
  width: '20px',
  padding: '1px',
  color: cssVar('iconColorHeavy'),
  marginLeft: '2px',

  '> svg': {
    height: '100%',
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

export interface BlockDragHandleProps {
  readonly children?: ReactNode;
  readonly menuOpen?: boolean;
  readonly dependenciesForBlock?: BlockDependents[];
  readonly onMouseDown?: HTMLProps<HTMLDivElement>['onMouseDown'];
  readonly onChangeMenuOpen?: (newMenuOpen: boolean) => void;
  readonly isHidden?: boolean;
  readonly isMultipleSelection?: boolean;
  readonly showEyeLabel?: boolean;
  readonly showAddBlock?: boolean;
  readonly onPlus?: () => void;
  readonly onAnnotation?: () => void;
  readonly onDelete?: (() => void) | 'none';
  readonly onDuplicate?: () => void;
  readonly onShowHide?: (action: 'show' | 'hide') => void;
  readonly onCopyHref?: () => void;
  readonly onMoveToTab?: (tabId: string) => void;
  readonly onMakeFullWidth?: () => void;
  readonly tabs?: Array<TabElement>;
  readonly aiPanel?: {
    text: string;
    visible: boolean;
    toggle: () => void;
  };
  readonly isDownloadable?: boolean;
  readonly onDownload?: () => void;
  readonly handleDownloadChart?: () => void;
  readonly needsUpgrade?: boolean;
  readonly path?: Path;
}

// eslint-disable-next-line complexity
export const BlockDragHandle = ({
  children,
  menuOpen = false,
  isHidden = false,
  isMultipleSelection = false,
  onShowHide = noop,
  showEyeLabel = false,
  onMouseDown,
  showAddBlock = true,
  onChangeMenuOpen = noop,
  tabs = [],
  onPlus = noop,
  onDelete = noop,
  onAnnotation = noop,
  onDuplicate = noop,
  onMoveToTab,
  onCopyHref,
  onMakeFullWidth,
  dependenciesForBlock,
  aiPanel,
  isDownloadable = false,
  onDownload = noop,
  handleDownloadChart,
  path,
}: BlockDragHandleProps): ReturnType<FC> => {
  const [isHovered, setIsHovered] = useState(false);

  const showAction = useCallback(() => onShowHide('show'), [onShowHide]);
  const hideAction = useCallback(() => onShowHide('hide'), [onShowHide]);
  const setHovered = useCallback(() => setIsHovered(true), [setIsHovered]);
  const setNotHovered = useCallback(() => setIsHovered(false), [setIsHovered]);

  const editor = useMyEditorRef();

  const onClick = useCallback(() => {
    onDelete !== 'none' && onChangeMenuOpen(!menuOpen);
  }, [menuOpen, onChangeMenuOpen, onDelete]);

  const isThisBlockUsedInCalculations =
    Array.isArray(dependenciesForBlock) && dependenciesForBlock.length !== 0;

  const showHidden = showEyeLabel && !isHovered;
  const menuButton = (
    <div
      data-testid="drag-handle"
      onMouseEnter={setHovered}
      onMouseLeave={setNotHovered}
      onClick={onClick}
      css={[handleStyle, !showHidden]}
      tabIndex={-1}
    >
      {showHidden ? <EyeLabel /> : <DragHandle />}
    </div>
  );

  const showHideButton = isHidden ? (
    <MenuItem icon={<Show />} onSelect={showAction}>
      Show to reader
    </MenuItem>
  ) : (
    <MenuItem icon={<Hide />} onSelect={hideAction}>
      Hide from reader
    </MenuItem>
  );

  const plusButton = (
    <button
      tabIndex={-1}
      onClick={useEventNoEffect(onPlus)}
      css={plusStyle}
      data-testid="plus-block-button"
    >
      <Add />
    </button>
  );

  const aiButton = aiPanel ? (
    <MenuItem icon={<Sparkles />} onSelect={aiPanel.toggle} isNew>
      AI
    </MenuItem>
  ) : null;

  const showCopyHref = useMemo(() => {
    if (!path) return false;
    const node = getNode<TopLevelValue>(editor, path);
    const supportedTypes = [
      ELEMENT_CODE_LINE,
      ELEMENT_TABLE,
      ELEMENT_CODE_LINE_V2,
      ELEMENT_VARIABLE_DEF,
    ];
    return onCopyHref && supportedTypes.includes(node?.type!);
  }, [editor, onCopyHref, path]);

  return (
    <div css={[gridStyles(), hideOnPrint]} onMouseDown={onMouseDown}>
      {showAddBlock && (
        <Tooltip trigger={plusButton} side="bottom" hoverOnly>
          <span css={css({ whiteSpace: 'nowrap', textAlign: 'center' })}>
            <strong>Click</strong> to add block below
          </span>
        </Tooltip>
      )}

      {menuOpen && (
        <MenuList
          root
          open={menuOpen}
          onChangeOpen={onChangeMenuOpen}
          trigger={menuButton}
          dropdown
          side="left"
        >
          {showHideButton}
          <MenuItem
            data-testid="duplicate-block"
            icon={<Duplicate />}
            onSelect={onDuplicate}
          >
            Duplicate
          </MenuItem>
          {showCopyHref && !isMultipleSelection && (
            <MenuItem icon={<Link />} onSelect={onCopyHref}>
              <Tooltip trigger={<span>Copy reference link</span>} side="right">
                <div css={{ width: '180px' }}>
                  <p css={[toolTipTitle, { textAlign: 'left' }]}>
                    Re-use Across Documents
                  </p>
                  <p css={[tooltipContent, { textAlign: 'left' }]}>
                    Share across different documents by generating a reference
                    link. Please note, for this feature to work, the original
                    document must be set to 'Public'.
                  </p>
                </div>
              </Tooltip>
            </MenuItem>
          )}
          {onMoveToTab && tabs.length > 0 && (
            <MenuList
              itemTrigger={
                <TriggerMenuItem icon={<Move />}>Move to tab</TriggerMenuItem>
              }
            >
              {tabs.map((t, i) => {
                const TabIcon = userIcons[t.icon || 'FileText'];
                return (
                  <MenuItem
                    key={t.id}
                    icon={<TabIcon />}
                    onSelect={() => onMoveToTab(t.id)}
                    testid={`move-to-tab-${i}`}
                  >
                    <div css={{ minWidth: '132px' }}>{t.name}</div>
                  </MenuItem>
                );
              })}
            </MenuList>
          )}
          {handleDownloadChart && (
            <MenuItem
              icon={<Download />}
              onSelect={() => {
                handleDownloadChart();
              }}
            >
              Download chart
            </MenuItem>
          )}
          {isDownloadable && (
            <MenuItem icon={<Download />} onSelect={onDownload}>
              <p>Download as CSV</p>
            </MenuItem>
          )}
          {children}
          {!isMultipleSelection ? aiButton : null}
          {isFlagEnabled('ENABLE_COMMENTS') && (
            <MenuItem icon={<Chat />} onSelect={onAnnotation}>
              Comment
            </MenuItem>
          )}
          {onMakeFullWidth && (
            <MenuItem icon={<FullWidthLayout />} onSelect={onMakeFullWidth}>
              Full width
            </MenuItem>
          )}
          <MenuItem disabled>
            <hr css={{ color: cssVar('backgroundDefault') }} />
          </MenuItem>
          {/* onDelete can be disabled by the parent component */}
          {isThisBlockUsedInCalculations ? (
            <DeleteWithDepsMenuItem
              blockInfo={dependenciesForBlock[0]}
              onSelect={typeof onDelete === 'function' ? onDelete : noop}
            />
          ) : typeof onDelete === 'function' ? ( // dependency graph
            <MenuItem icon={<Trash />} onSelect={onDelete}>
              Delete
            </MenuItem>
          ) : null}
        </MenuList>
      )}

      <Tooltip trigger={menuButton} side="bottom" hoverOnly>
        <span
          css={css([
            p12Medium,
            { color: componentCssVars('TooltipText') },
            { whiteSpace: 'nowrap', textAlign: 'center' },
          ])}
        >
          <strong css={[p12Medium, { color: componentCssVars('TooltipText') }]}>
            Drag
          </strong>{' '}
          to move
          <br />
          <strong css={[p12Medium, { color: componentCssVars('TooltipText') }]}>
            Click
          </strong>{' '}
          for options
        </span>
      </Tooltip>
    </div>
  );
};

const toolTipTitle = css(p12Medium, {
  textAlign: 'center',
  color: componentCssVars('TooltipText'),
});

const tooltipContent = css(p12Regular, {
  marginTop: '6px',
  color: componentCssVars('TooltipTextSecondary'),
  textAlign: 'center',
});

const EyeLabel = () => (
  <div css={eyeLabelStyles} contentEditable={false}>
    <Hide />
  </div>
);
