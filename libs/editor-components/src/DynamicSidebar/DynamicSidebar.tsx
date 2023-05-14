import { useCallback, useMemo, useState } from 'react';
import { Path } from 'slate';
import { MyElement, useTEditorRef } from '@decipad/editor-types';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import { css } from '@emotion/react';
import { getNode, isElement } from '@udecode/plate';
import { AutocompleteName } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { cssVar, smallDesktopLandscapeQuery } from '@decipad/ui';
import { useEditorChange } from '@decipad/editor-hooks';
import { catalogItems } from '../NumberCatalog/catalogItems';
import { selectCatalogNames } from '../NumberCatalog/selectCatalogNames';
import { toVar } from '../NumberCatalog/toVar';
import { useOnDragEnd } from '../utils/useDnd';

import Insert from './Insert/Insert';
import Modelling from './Modelling/Modelling';

const catalogDebounceTimeMs: number = 1_000;

export const DynamicSidebar = () => {
  const [view, setView] = useState<string>('Insert');
  const [search, setSearch] = useState<string>('');
  const [activeBlockPath, setActiveBlockPath] = useState<Path | undefined>(
    undefined
  );

  const editor = useTEditorRef();
  const onDragStart = useMemo(() => onDragStartSmartRef(editor), [editor]);
  const onDragEnd = useOnDragEnd();

  const computer = useComputer();

  const catalog = useMemo(() => catalogItems(editor), [editor]);
  const items = computer.getNamesDefined$.useWithSelectorDebounced(
    catalogDebounceTimeMs,
    useCallback(
      (_items: AutocompleteName[]) => {
        return catalog(selectCatalogNames(_items).map(toVar));
      },
      [catalog]
    )
  );

  useEditorChange((edt): MyElement | undefined => {
    const path = edt.selection?.focus?.path;

    if (path) {
      const firstBlockPath = [path[0]];
      setActiveBlockPath(firstBlockPath);
      const node = getNode(edt, firstBlockPath);
      if (node && isElement(node)) {
        return node;
      }
    }
    return undefined;
  });

  const lastElemPath: Path | undefined = [editor.children.length - 1];
  const MENU: string[] = ['Insert', 'Modelling', 'Style', 'Settings'];

  return (
    <div css={dynamicSidebar}>
      <div css={dynamicSidebarContent}>
        <div data-testid="dynamic-sidebar_nav" css={dynamicSidebarNav}>
          {MENU.map((option) => (
            <button
              css={css(dynamicSidebarNavBtn, view === option && { opacity: 1 })}
              data-testid={`sidebar-nav-btn-${option}`}
              onClick={() => {
                setView(option);
                setSearch('');
              }}
              key={`sidebar-nav-btn-${option}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div css={dynamicSidebarItems}>
          {view !== 'Settings' && (
            <input
              type="text"
              data-testid="dynamic-sidebar__search"
              css={dynamicSidebarSearch}
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}

          {view === 'Modelling' && (
            <Modelling
              items={items}
              search={search}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          )}

          {view === 'Insert' && (
            <Insert
              computer={computer}
              editor={editor}
              search={search}
              path={activeBlockPath || lastElemPath}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const dynamicSidebar = css({
  position: 'fixed',
  width: '400px',
  minWidth: ' 400px',
  right: 0,
  top: 66,
  zIndex: '1',
  [smallDesktopLandscapeQuery]: {
    display: 'none',
  },
});

const dynamicSidebarContent = css({
  position: 'fixed',
  width: 'inherit',
  borderLeft: `solid 1px ${cssVar('strongHighlightColor')}`,
  height: '100%',
  overflowY: 'scroll',
  backgroundColor: cssVar('backgroundColor'),
});

const dynamicSidebarNav = css({
  position: 'fixed',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: '1.5rem 2rem',
  width: 'inherit',
  borderBottom: `solid 1px ${cssVar('strongHighlightColor')}`,
  backgroundColor: cssVar('backgroundColor'),
  zIndex: '1',
  cursor: 'pointer',
});

const dynamicSidebarNavBtn = {
  fontWeight: '500',
  opacity: '0.5',
  transition: '0.3s ease',
  cursor: 'pointer',
  ':hover': {
    opacity: '1',
  },
};

// add search icon
const dynamicSidebarSearch = css({
  backgroundRepeat: 'no-repeat',
  backgroundSize: '14px 14px',
  backgroundPosition: '15px 50%',
  padding: '10px 20px',
  width: '100%',
  border: `solid 1px ${cssVar('strongHighlightColor')}`,
  borderRadius: '15px',
  backgroundColor: cssVar('backgroundColor'),
  marginTop: '1rem',
  transition: '0.3s ease',
});

const dynamicSidebarItems = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '4rem 2rem',
  paddingBottom: '8rem',
  width: 'inherit',
  overflowY: 'scroll',
});
