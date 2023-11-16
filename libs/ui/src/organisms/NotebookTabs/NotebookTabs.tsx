/* eslint decipad/css-prop-named-variable: 0 */
import styled from '@emotion/styled';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cssVar, p13Bold, p13Medium } from '../../primitives';
import { IconPopover, MenuList } from '../../molecules';
import {
  AlignArrowLeftAlt,
  AlignArrowRightAlt,
  ArrowLeft,
  ArrowRight,
  Brush,
  Caret,
  Edit,
  Hide,
  Plus,
  Show,
  Switch,
  Trash,
} from '../../icons';
import * as icons from '../../icons';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useToast } from '@decipad/toast';
import { deciTabsOverflowXStyles } from '../../styles/scrollbars';
import { UserIconKey } from '@decipad/editor-types';

import { noop } from '@decipad/utils';
import { ClientEventsContext } from '@decipad/client-events';

type UITab = {
  id: string;
  name: string;
  icon?: UserIconKey;
  isHidden?: boolean;
};

export interface TabsProps {
  readonly tabs: UITab[];
  readonly isReadOnly: boolean;
  readonly isEmbed: boolean;
  readonly activeTabId: string | undefined;
  readonly onClick: (id: string) => void;
  readonly onCreateTab: () => string;
  readonly onRenameTab: (tabId: string, name: string) => void;
  readonly onMoveTab: (tabId: string, index: number) => void;
  readonly onDeleteTab: (tabId: string) => void;
  readonly onChangeIcon: (tabId: string, icon: UserIconKey) => void;
  readonly onToggleShowHide: (tabId: string) => void;
}

export const NotebookTabs: FC<TabsProps> = ({
  tabs,
  isEmbed,
  activeTabId,
  isReadOnly,
  onClick,
  onCreateTab,
  onRenameTab,
  onDeleteTab,
  onMoveTab,
  onChangeIcon: _onChangeIcon,
  onToggleShowHide,
}) => {
  const [editableTabId, setEditableTabId] = useState<string | undefined>(
    undefined
  );

  const filteredTabs = useMemo(() => {
    return isReadOnly ? tabs.filter((tab) => !tab.isHidden) : tabs;
  }, [tabs, isReadOnly]);

  const toast = useToast();

  const clientEvent = useContext(ClientEventsContext);

  // Used to set the width of the input to the length of the tab name
  const resizeSpanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState('auto');
  const [inputContent, setInputContent] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (resizeSpanRef.current && inputContent) {
      setInputWidth(`${resizeSpanRef.current.offsetWidth}px`);
    }
  }, [inputContent]);

  const onChangeInputResize = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target) {
        return;
      }

      const { value } = event.target;
      setInputContent(value || ' ');
    },
    []
  );
  // End of part related to input width

  const containerRef = useRef<HTMLDivElement>(null);

  const [hasScroll, setHasScroll] = useState(false);

  const containerHasScroll = useMemo(() => {
    return () => {
      if (!containerRef.current) {
        return false;
      }

      return (
        containerRef.current.scrollWidth > containerRef.current.clientWidth
      );
    };
  }, [containerRef]);

  useEffect(() => {
    setHasScroll(containerHasScroll());
  }, [containerHasScroll, tabs]);

  const onInputFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      event.target.select();
      onChangeInputResize(event);
    },
    [onChangeInputResize]
  );

  const isLastTab = useCallback(
    (id: string) => {
      return tabs.filter((tab) => tab.id !== id).length === 0;
    },
    [tabs]
  );

  const isLastVisibleTab = useCallback(
    (id: string) => {
      return tabs.filter((tab) => tab.id !== id).every((tab) => tab.isHidden);
    },
    [tabs]
  );

  const getCanHideDelete = useCallback(
    (id: string) => {
      return !(isLastTab(id) || isLastVisibleTab(id));
    },
    [isLastTab, isLastVisibleTab]
  );

  const getCanMove = useCallback(
    (id: string) => (direction: 'left' | 'right') => {
      switch (direction) {
        case 'left':
          return tabs.findIndex((tab) => tab.id === id) > 0;
        case 'right':
          return tabs.findIndex((tab) => tab.id === id) < tabs.length - 1;
      }
    },
    [tabs]
  );

  const onShowHide = useCallback(
    (id: string) => () => {
      if (isLastTab(id)) {
        toast.warning('Cannot hide the last tab');
        return;
      }

      if (isLastVisibleTab(id)) {
        toast.warning('Cannot hide the last visible tab');
        return;
      }

      onToggleShowHide(id);
    },
    [onToggleShowHide, toast, isLastTab, isLastVisibleTab]
  );

  const onDelete = useCallback(
    (id: string) => () => {
      if (isLastTab(id)) {
        toast.warning('Cannot delete the last tab');
        return;
      }

      if (isLastVisibleTab(id)) {
        toast.warning('Cannot delete the last visible tab');
        return;
      }

      onDeleteTab(id);
    },
    [onDeleteTab, toast, isLastTab, isLastVisibleTab]
  );

  const onMove = useCallback(
    (id: string) => (direction: 'start' | 'left' | 'right' | 'end') => {
      const index = tabs.findIndex((tab) => tab.id === id);
      switch (direction) {
        case 'start':
          onMoveTab(id, 0);
          break;
        case 'left':
          onMoveTab(id, index - 1);
          break;
        case 'right':
          onMoveTab(id, index + 1);
          break;
        case 'end':
          onMoveTab(id, tabs.length - 1);
          break;
      }
    },
    [tabs, onMoveTab]
  );

  const onChangeName = useCallback(
    (id: string) => () => {
      onClick(id);
      setEditableTabId(id);
    },
    [onClick]
  );

  const onChangeIcon = useCallback(
    (id: string) => (icon: UserIconKey) => {
      _onChangeIcon(id, icon);
    },
    [_onChangeIcon]
  );

  const onSubmitEdit = useCallback(
    (id: string) => {
      if (!inputContent) {
        return;
      }

      const value = inputContent.trim();

      if (value === '') {
        toast.warning('Tab name cannot be empty');
        setEditableTabId(undefined);
        return;
      }
      setEditableTabId(undefined);
      onRenameTab(id, value);
    },
    [onRenameTab, toast, inputContent]
  );

  const handleAddTab = useCallback(() => {
    clientEvent({
      type: 'action',
      action: 'create new tab',
    });
    const id = onCreateTab();
    setEditableTabId(id);
  }, [onCreateTab, clientEvent]);

  const handleKeyPress = useCallback(
    (id: string) => (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();

        onSubmitEdit(id);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();

        setEditableTabId(undefined);
      }
    },
    [onSubmitEdit]
  );

  return (
    <TabsWrapper
      isEmbed={isEmbed}
      hasScroll={hasScroll}
      isFirstTab={filteredTabs[0]?.id === activeTabId}
    >
      <TabsScrollWrapper ref={containerRef}>
        <TabsContainer>
          {filteredTabs.map(({ id, name, icon, isHidden }) => {
            if (id === editableTabId) {
              return (
                <TabWrapper
                  hidden={isReadOnly && isHidden}
                  isHidden={isHidden ?? false}
                  value={id}
                  key={id}
                  isActive={true}
                >
                  <TabForm>
                    <HiddenResizeSpan ref={resizeSpanRef}>
                      {inputContent}
                    </HiddenResizeSpan>
                    <TabInput
                      onChange={onChangeInputResize}
                      onFocus={onInputFocus}
                      style={{
                        width: inputWidth,
                      }}
                      onKeyDown={handleKeyPress(id)}
                      onBlur={() => onSubmitEdit(id)}
                      type="text"
                      name="tabName"
                      defaultValue={name}
                      placeholder="Name..."
                      autoFocus
                      pattern=".*[^ ].*"
                    />
                    <input type="submit" hidden />
                  </TabForm>
                </TabWrapper>
              );
            }

            return (
              <Tab
                key={id}
                id={id}
                name={name}
                icon={icon ?? 'Receipt'}
                isReadOnly={isReadOnly}
                isHidden={isHidden ?? false}
                isActive={id === activeTabId}
                canHideDelete={getCanHideDelete(id)}
                canMove={getCanMove(id)}
                onClick={() => onClick(id)}
                onChangeIcon={onChangeIcon(id)}
                onRename={onChangeName(id)}
                onDelete={onDelete(id)}
                onMove={onMove(id)}
                onToggleShowHide={onShowHide(id)}
              />
            );
          })}
          <NewTabButton
            hidden={isReadOnly}
            disabled={isReadOnly}
            onClick={handleAddTab}
            data-testid="add-tab-button"
          >
            <Plus />
            Add tab
          </NewTabButton>
        </TabsContainer>
      </TabsScrollWrapper>
    </TabsWrapper>
  );
};

interface TabProps {
  name: string;
  icon: UserIconKey;
  id: string;
  isHidden: boolean;
  isActive: boolean;
  isReadOnly: boolean;
  canHideDelete: boolean;
  canMove: (direction: 'left' | 'right') => boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
  onMove: (direction: 'start' | 'left' | 'right' | 'end') => void;
  onChangeIcon: (icon: UserIconKey) => void;
  onToggleShowHide: () => void;
}

const Tab: FC<TabProps> = ({
  isActive,
  isReadOnly,
  name,
  icon,
  id,
  canHideDelete,
  canMove,
  isHidden,
  onMove,
  onClick,
  onRename,
  onDelete,
  onChangeIcon,
  onToggleShowHide,
}) => {
  const [open, setOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const Icon = icons[icon];

  const handleClickRename = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      event.preventDefault();

      switch (event.detail) {
        case 1:
          onClick();
          break;
        // Double click
        case 2:
          onRename();
          break;
      }
    },
    [onClick, onRename]
  );

  const handleOpenIconPopover = useCallback(() => {
    // This is needed to make sure the popover opens after the click event
    setTimeout(() => {
      iconRef.current?.click();
    }, 0);
  }, []);

  return (
    <TabWrapper
      hidden={isReadOnly && isHidden}
      value={id}
      isActive={isActive}
      isHidden={isHidden}
      data-testid="tab-button"
      onClick={isReadOnly ? onClick : handleClickRename}
    >
      <TabContent>
        {isReadOnly ? (
          <TabIcon data-testid="tab-icon">
            <Icon />
          </TabIcon>
        ) : isHidden ? (
          <TabIcon data-testid="tab-hidden">
            <Hide />
          </TabIcon>
        ) : (
          <IconPopover
            iconOnly
            color="Catskill"
            trigger={
              <TabIcon data-testid="tab-icon" ref={iconRef}>
                <Icon />
              </TabIcon>
            }
            onChangeIcon={onChangeIcon}
            onChangeColor={noop}
          />
        )}
        <TabName data-testid="tab-name">{name}</TabName>
      </TabContent>
      {!isReadOnly && (
        <MenuList
          root
          dropdown
          trigger={
            <IconWrapper data-testid="tab-options-button">
              <Caret variant={open ? 'up' : 'down'} />
            </IconWrapper>
          }
          open={open}
          onChangeOpen={setOpen}
          dataTestid="tab-options-menu"
        >
          <MenuItem icon={<Edit />} onSelect={onRename}>
            Rename tab
          </MenuItem>

          <MenuList
            itemTrigger={
              <TriggerMenuItem
                disabled={!(canMove('left') || canMove('right'))}
                icon={<Switch />}
              >
                Move tab
              </TriggerMenuItem>
            }
          >
            <MenuItem
              icon={<ArrowLeft />}
              onSelect={() => onMove('left')}
              disabled={!canMove('left')}
            >
              <div css={{ minWidth: '64px' }}>Left</div>
            </MenuItem>
            <MenuItem
              icon={<ArrowRight />}
              onSelect={() => onMove('right')}
              disabled={!canMove('right')}
            >
              <div css={{ minWidth: '64px' }}>Right</div>
            </MenuItem>
            <MenuItem
              icon={<AlignArrowLeftAlt />}
              onSelect={() => onMove('start')}
              disabled={!canMove('left')}
            >
              <div css={{ minWidth: '64px' }}>To the start</div>
            </MenuItem>
            <MenuItem
              icon={<AlignArrowRightAlt />}
              onSelect={() => onMove('end')}
              disabled={!canMove('right')}
            >
              <div css={{ minWidth: '64px' }}>To the end</div>
            </MenuItem>
          </MenuList>

          <MenuItem
            icon={<Brush />}
            onSelect={handleOpenIconPopover}
            onClick={(event) => event.stopPropagation()}
            disabled={isHidden}
          >
            Change icon
          </MenuItem>
          <MenuItem
            icon={isHidden ? <Show /> : <Hide />}
            onSelect={onToggleShowHide}
            disabled={!canHideDelete}
          >
            {isHidden ? 'Show to reader' : 'Hide from reader'}
          </MenuItem>
          <MenuItem disabled>
            <hr css={{ color: cssVar('backgroundDefault') }} />
          </MenuItem>
          <MenuItem
            icon={<Trash />}
            onSelect={onDelete}
            disabled={!canHideDelete}
            onClick={(event) => event.stopPropagation()}
          >
            Delete Tab
          </MenuItem>
        </MenuList>
      )}
    </TabWrapper>
  );
};

const TabsWrapper = styled(TabsPrimitive.Root)<{
  hasScroll: boolean;
  isEmbed: boolean;
  isFirstTab: boolean;
}>((props) => ({
  position: 'relative',
  zIndex: 10,
  display: 'flex',
  flex: props.isEmbed ? '0 0 40px' : '0 0 52px',
  width: '100%',
  backgroundColor: cssVar('backgroundAccent'),

  ...((props.hasScroll || props.isFirstTab) && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -16,
      left: 0,
      width: '16px',
      height: '16px',
      backgroundColor: cssVar('backgroundMain'),
    },
  }),

  ...(props.hasScroll && {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -16,
      right: 0,
      width: '16px',
      height: '16px',
      backgroundColor: cssVar('backgroundMain'),
    },
  }),
}));

const TabsScrollWrapper = styled.div(
  {
    position: 'relative',
    display: 'flex',
    height: '100%',
    margin: '0px -1px',
    overflow: 'hidden',
    width: '100%',
  },
  deciTabsOverflowXStyles
);

const TabsContainer = styled(TabsPrimitive.List)({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  height: '40px',
  backgroundColor: cssVar('backgroundHeavy'),
  borderBottomLeftRadius: '16px',
  borderBottomRightRadius: '16px',
});

const IconWrapper = styled.div({
  position: 'absolute',
  top: '10px',
  right: '10px',
  width: '20px',
  height: '20px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
    svg: {
      path: {
        fill: cssVar('textHeavy'),
      },
    },
  },

  svg: {
    width: '16px',
    height: '16px',

    path: {
      fill: cssVar('textSubdued'),
    },
  },
});

const TabWrapper = styled(TabsPrimitive.Trigger)<{
  isActive: boolean;
  isHidden: boolean;
}>((props) => ({
  position: 'relative',
  minWidth: '80px',
  height: '40px',
  display: 'flex',
  gap: '4px',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0px 8px',
  cursor: 'pointer',

  ...(props.isHidden &&
    !props.isActive && {
      opacity: 0.5,
    }),

  ...(props.isActive && {
    backgroundColor: cssVar('backgroundMain'),
    borderRadius: '0px 0px 12px 12px',
    boxShadow: `inset 0px -1px 0px 1px ${cssVar('backgroundHeavy')}`,

    '&:first-of-type': {
      borderRadius: '0px 0px 12px 16px',

      '&::before': {
        display: 'none',
      },
    },

    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      width: '12px',
      height: '12px',
      backgroundColor: cssVar('backgroundHeavy'),
    },

    '&::before': {
      left: -11, // account 1px for inset shadow
      borderRadius: '0px 12px 0px 0px',
      boxShadow: `4px -4px 0 4px ${cssVar('backgroundMain')}`,
    },

    '&::after': {
      right: -11, // account 1px for inset shadow
      borderRadius: '12px 0px 0px 0px',
      boxShadow: `-4px -4px 0 4px ${cssVar('backgroundMain')}`,
    },
  }),
}));

const TabIcon = styled.div({
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  svg: {
    width: '18px',
    height: '18px',
  },
});

const TabName = styled.span({
  ...p13Medium,
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: '40px',
});

const TabContent = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  margin: '0px 28px 0px 4px',
  minWidth: '64px',
  gap: '4px',
});

const TabForm = styled.div({
  position: 'relative',
  minWidth: '52px',
  margin: '0px 44px 0px 8px',
});

// Used to update width of form, otherwise text jumps when typing
const HiddenResizeSpan = styled.span({
  ...p13Medium,
  opacity: 0,
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  padding: '0px 2px',
});

const TabInput = styled.input({
  ...p13Bold,
  position: 'absolute',
  left: '2px',
  top: '2px',
  minWidth: '100%',
  backgroundColor: cssVar('backgroundMain'),
  border: 'none',

  '&::placeholder': {
    color: cssVar('textSubdued'),
  },
});

const NewTabButton = styled.button({
  ...p13Medium,
  position: 'sticky',
  right: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '32px',
  padding: '2px 12px 0px 8px',
  marginLeft: '6px',
  borderRadius: '8px',
  backgroundColor: cssVar('backgroundHeavy'),
  border: 'none',
  color: cssVar('textSubdued'),
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  boxShadow: `inset 0px 0px 0px 1px ${cssVar('backgroundHeavy')}`,

  svg: {
    width: '18px',
    height: '18px',
    marginBottom: '2px',

    path: {
      stroke: cssVar('textSubdued'),
    },
  },

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
    color: cssVar('textHeavy'),

    svg: {
      path: {
        stroke: cssVar('textHeavy'),
      },
    },
  },
});
