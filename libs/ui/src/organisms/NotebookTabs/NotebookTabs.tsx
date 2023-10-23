/* eslint decipad/css-prop-named-variable: 0 */
import styled from '@emotion/styled';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cssVar, p13Bold, p13Medium } from '../../primitives';
import { IconPopover, MenuList } from '../../molecules';
import { Caret, Edit, Hide, Plus, Show, Trash } from '../../icons';
import * as icons from '../../icons';
import { MenuItem } from '../../atoms';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useToast } from '@decipad/toast';
import { deciTabsOverflowXStyles } from '../../styles/scrollbars';
import { UserIconKey } from '@decipad/editor-types';

import { noop } from '@decipad/utils';

export interface TabsProps {
  readonly tabs: Array<{
    id: string;
    name: string;
    icon?: UserIconKey;
    isHidden?: boolean;
  }>;
  readonly isReadOnly: boolean;
  readonly activeTabId: string | undefined;
  readonly onClick: (id: string) => void;
  readonly onCreateTab: () => string;
  readonly onRenameTab: (tabId: string, name: string) => void;
  readonly onDeleteTab: (tabId: string) => void;
  readonly onChangeIcon: (tabId: string, icon: UserIconKey) => void;
  readonly onToggleShowHide: (tabId: string) => void;
}

export const NotebookTabs: FC<TabsProps> = ({
  tabs,
  activeTabId,
  isReadOnly,
  onClick,
  onCreateTab,
  onRenameTab,
  onDeleteTab,
  onChangeIcon: _onChangeIcon,
  onToggleShowHide,
}) => {
  const [editableTabId, setEditableTabId] = useState<string | undefined>(
    undefined
  );

  const toast = useToast();

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

  const onDelete = useCallback(
    (id: string, isLast: boolean) => () => {
      if (isLast) {
        toast.warning('You cannot delete the last tab');
        return;
      }

      onDeleteTab(id);
    },
    [onDeleteTab, toast]
  );

  const onChangeIcon = useCallback(
    (id: string) => (icon: UserIconKey) => {
      _onChangeIcon(id, icon);
    },
    [_onChangeIcon]
  );

  const onSubmitEdit = useCallback(
    (id: string) => (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { value } = event.currentTarget.tabName as HTMLInputElement;
      if (value == null) {
        return;
      }

      if (value === '') {
        toast.warning('Tab name cannot be empty');
        setEditableTabId(undefined);
        return;
      }

      onRenameTab(id, value);
      setEditableTabId(undefined);
    },
    [onRenameTab, toast]
  );

  return (
    <TabsWrapper hasScroll={hasScroll} isFirstTab={tabs[0].id === activeTabId}>
      <TabsScrollWrapper ref={containerRef}>
        <TabsContainer>
          {tabs.map(({ id, name, icon, isHidden }) => {
            if (id === editableTabId) {
              return (
                <TabWrapper
                  hidden={isReadOnly && isHidden}
                  isHidden={isHidden ?? false}
                  value={id}
                  key={id}
                  isActive={true}
                >
                  <TabForm onSubmit={onSubmitEdit(id)}>
                    <HiddenResizeSpan ref={resizeSpanRef}>
                      {inputContent}
                    </HiddenResizeSpan>
                    <TabInput
                      onChange={onChangeInputResize}
                      onFocus={onChangeInputResize}
                      style={{
                        width: inputWidth,
                      }}
                      onBlur={() => setEditableTabId(undefined)}
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
                onClick={() => onClick(id)}
                onChangeIcon={onChangeIcon(id)}
                onRename={() => setEditableTabId(id)}
                onDelete={onDelete(id, tabs.length === 1)}
                onToggleShowHide={() => onToggleShowHide(id)}
              />
            );
          })}
          <NewTabButton
            hidden={isReadOnly}
            disabled={isReadOnly}
            onClick={() => {
              const id = onCreateTab();
              setEditableTabId(id);
            }}
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
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
  onChangeIcon: (icon: UserIconKey) => void;
  onToggleShowHide: () => void;
}

const Tab: FC<TabProps> = ({
  isActive,
  isReadOnly,
  name,
  icon,
  id,
  isHidden,
  onClick,
  onRename,
  onDelete,
  onChangeIcon,
  onToggleShowHide,
}) => {
  const [open, setOpen] = useState(false);

  const Icon = icons[icon];

  const handleClickRename = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();

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

  return (
    <TabWrapper
      hidden={isReadOnly && isHidden}
      value={id}
      isActive={isActive}
      isHidden={isHidden}
      data-testid="tab-button"
    >
      <TabContent onClick={isReadOnly ? onClick : handleClickRename}>
        {isReadOnly ? (
          <TabIcon>
            <Icon />
          </TabIcon>
        ) : isHidden ? (
          <TabIcon>
            <Hide />
          </TabIcon>
        ) : (
          <IconPopover
            iconOnly
            color="Catskill"
            trigger={
              <TabIcon>
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
            Rename Tab
          </MenuItem>
          <MenuItem
            icon={isHidden ? <Show /> : <Hide />}
            onSelect={onToggleShowHide}
          >
            {isHidden ? 'Show To Reader' : 'Hide From Reader'}
          </MenuItem>
          <MenuItem disabled>
            <hr css={{ color: cssVar('backgroundDefault') }} />
          </MenuItem>
          <MenuItem icon={<Trash />} onSelect={onDelete}>
            Delete Tab
          </MenuItem>
        </MenuList>
      )}
    </TabWrapper>
  );
};

const TabsWrapper = styled(TabsPrimitive.Root)<{
  hasScroll: boolean;
  isFirstTab: boolean;
}>((props) => ({
  position: 'relative',
  zIndex: 10,
  display: 'flex',
  flex: '0 0 52px',
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
    height: '52px',
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

const TabForm = styled.form({
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
