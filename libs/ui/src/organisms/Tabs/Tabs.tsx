import styled from '@emotion/styled';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { componentCssVars, cssVar } from '../../primitives';
import { MenuList } from '../../molecules';
import { Brush, Caret, Edit, Hide, Plus, Trash } from '../../icons';
import { MenuItem } from '../../atoms';

export interface TabsProps {
  readonly tabs: Array<{ id: string; name: string }>;
  readonly activeTabId: string | undefined;
  readonly onClick: (id: string) => void;
  readonly onCreateTab: () => string;
  readonly onRenameTab: (tabId: string, name: string) => void;
  readonly onDeleteTab: (tabId: string) => void;
}

export const Tabs: FC<TabsProps> = ({
  tabs,
  activeTabId,
  onClick,
  onCreateTab,
  onRenameTab,
  onDeleteTab,
}) => {
  const [newTabId, setNewTabId] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newTabId) {
      inputRef.current?.focus();
    }
  }, [newTabId]);

  return (
    <Main>
      {tabs.map(({ id, name }) => {
        if (id === newTabId) {
          return (
            <NewTab key={id}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = inputRef.current?.value;
                  if (value == null) return;

                  onRenameTab(newTabId, value);
                  setNewTabId(undefined);
                }}
              >
                <input
                  ref={inputRef}
                  onBlur={() => setNewTabId(undefined)}
                  type="text"
                  placeholder="Name..."
                  pattern=".*[^ ].*"
                  required
                />
                <input type="submit" hidden />
              </form>
            </NewTab>
          );
        }

        return (
          <SingleTabUI
            key={id}
            isActive={id === activeTabId}
            onClick={() => onClick(id)}
            onRename={() => setNewTabId(id)}
            onDelete={() => onDeleteTab(id)}
          >
            {name}
          </SingleTabUI>
        );
      })}
      <button
        onClick={() => {
          const id = onCreateTab();
          setNewTabId(id);
        }}
      >
        <Plus />
        Add tab
      </button>
    </Main>
  );
};

interface SingleTabProps {
  isActive: boolean;
  children: ReactNode;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const SingleTabUI: FC<SingleTabProps> = ({
  isActive,
  children,
  onClick,
  onRename,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <TabWrapper isActive={isActive}>
      <div onClick={onClick}>{children}</div>
      <MenuList
        root
        dropdown
        trigger={
          <IconWrapper>
            <Caret variant="down" />
          </IconWrapper>
        }
        open={open}
        onChangeOpen={setOpen}
      >
        <MenuItem icon={<Edit />} onSelect={onRename}>
          Rename Tab
        </MenuItem>
        <MenuItem icon={<Brush />}>Change Icon</MenuItem>
        <MenuItem icon={<Hide />}>Hide From Reader</MenuItem>
        <MenuItem icon={<Trash />} onSelect={onDelete}>
          Delete Tab
        </MenuItem>
      </MenuList>
    </TabWrapper>
  );
};

const IconWrapper = styled.div({
  width: '16px',
  height: '16px',
});

const Main = styled.div({
  zIndex: 10,
  width: '100%',
  overflowX: 'auto',
  display: 'flex',
  height: '40px',
  backgroundColor: componentCssVars('ButtonTertiaryDefaultBackground'),
  borderBottomLeftRadius: '16px',
  borderBottomRightRadius: '16px',

  button: {
    display: 'flex',
    alignItems: 'center',
  },

  svg: {
    width: '16px',
    height: '16px',
  },
});

const TabWrapper = styled.div<{ isActive: boolean }>((props) => ({
  width: '110px',
  display: 'flex',
  gap: '4px',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '16px',
  ...(props.isActive && {
    backgroundColor: cssVar('backgroundMain'),
    borderRadius: '0px 0px 16px 16px',
  }),

  svg: {
    width: '16px',
    height: '16px',
  },
}));

const NewTab = styled.div({
  width: '110px',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '16px',
  input: {
    width: '100%',
    border: 0,
    borderRadius: '4px',
    padding: '4px',
    backgroundColor: 'inherit',
  },
});
