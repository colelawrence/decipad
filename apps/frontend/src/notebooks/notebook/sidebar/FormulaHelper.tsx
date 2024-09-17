import type { SidebarComponentProps } from './types';
import { getBuiltinsForAutocomplete } from '@decipad/remote-computer';
import type { AutocompleteName } from '@decipad/language-interfaces';
import groupBy from 'lodash/groupBy';
import {
  Calendar,
  Table,
  List,
  Dollar,
  Number,
  Check,
  All,
  MagnifyingGlass,
  CaretDown,
  CaretUp,
} from 'libs/ui/src/icons';
import styled from '@emotion/styled';
import {
  Button,
  cssVar,
  InputField,
  jsCode,
  p13Regular,
  p14Medium,
  p14Regular,
  scrollbars,
} from '@decipad/ui';
import * as btnStyles from '@decipad/ui/src/shared/atoms/Button/Button';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import * as Collapsible from '@radix-ui/react-collapsible';
import {
  forwardRef,
  HTMLProps,
  ReactNode,
  useCallback,
  useMemo,
  useState,
  type FC,
} from 'react';
import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
import { useComputer } from '@decipad/editor-hooks';

const builtInIdentifiers = groupBy(
  getBuiltinsForAutocomplete().filter((v) => !!v.explanation),
  'formulaGroup'
);

const iconMap: {
  [K in NonNullable<AutocompleteName['formulaGroup']>]: ReactNode;
} = {
  Algebra: <Number />,
  Columns: <List />,
  Conditions: <Check />,
  Correctness: <Check />,
  Dates: <Calendar />,
  Finance: <Dollar />,
  Logical: <Check />,
  Numbers: <Number />,
  Ranges: <Number />,
  'Tables or Columns': <Table />,
  Tables: <Table />,
  Trigonometric: <Number />,
  Units: <All />,
};

const IdentifierEntry = styled.li({
  minHeight: '32px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '6px',
  overflow: 'clip',

  '&[data-state=open]': {
    marginBottom: '4px',
  },

  '& > button': {
    height: '32px',
    display: 'flex',
    textAlign: 'left',
    justifyContent: 'start',
    color: cssVar('textDefault'),
    gap: '8px',
    '&[data-state=closed]:hover, &[data-state=closed]': {
      background: 'inherit',
    },
    '&[data-state=open]': {
      background: cssVar('backgroundDefault'),
    },
    '& > span:nth-last-of-type(2)': {
      flexGrow: 1,
    },

    '& > span > svg': {
      color: cssVar('textTitle'),
      opacity: 0.0,
      margin: '0 8px',
    },
    '&[data-state=open] > span > svg': {
      opacity: 0.6,
    },
    '&:hover > span > svg': {
      opacity: 0.3,
    },
  },
});

const IdentifierGroup = styled.div({
  height: '32px',
  color: cssVar('textDisabled'),
  display: 'flex',
  alignItems: 'end',
  padding: '8px',
  paddingBottom: '4px',
});
const IdentifierSearch = styled.div(p13Regular, {
  display: 'flex',
  alignItems: 'center',
  minWidth: '24ch',
  gap: '4px',

  border: `1px solid ${cssVar('borderDefault')}`,
  borderRadius: '8px',
  background: cssVar('backgroundMain'),

  padding: '6px',
  paddingRight: '12px',

  '& > svg': {
    width: '20px',
    height: '20px',
    color: cssVar('textDisabled'),
  },

  input: {
    marginTop: '1px',
    height: '18px',
    lineHeight: '18px',
    border: 'none',
  },
});

const IdentifierWrapper = styled.div(p14Medium, {
  display: 'flex',
  flexDirection: 'column',

  padding: '16px',

  background: cssVar('backgroundMain'),
  borderRadius: '16px',
  overflow: 'hidden',

  '& > ul': css(
    {
      paddingTop: '8px',
      marginRight: '-8px',
      overflowY: 'auto',
      '& > li': {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        // alignItems: 'center',

        svg: {
          height: '16px',
          width: '16px',
        },
      },
    },
    scrollbars.noTrackScrollbarStyles
  ),
});

const IdentifierDescriptionWrapper = styled.section(p14Regular, {
  padding: '8px',
  paddingTop: '0',
  background: cssVar('backgroundDefault'),
  'h1.unknown': {
    marginBottom: '8px',
  },
  p: {
    ...p14Regular,
    color: cssVar('textDisabled'),
    span: {
      paddingLeft: '8px',
    },
  },
  pre: {
    ...jsCode,
    color: cssVar('textTitle'),
    background: cssVar('backgroundHeavy'),
    borderRadius: '6px',
    marginTop: '6px',
    marginBottom: '16px',
    padding: '4px',

    wordBreak: 'break-word',
    whiteSpace: 'break-spaces',
  },
  button: {
    padding: '0',
    height: '24px',
    color: cssVar('textTitle'),
    '&:hover': {
      color: cssVar('textSubdued'),
    },
    '&:active': {
      color: cssVar('textDefault'),
    },
  },

  // For some reason the animations are really choppy (tested locally on ff + chrome)
  // If you can figure out why it's choppy feel free to bring them back :)
  //
  // overflow: 'hidden',
  // '&[data-state=open]': {
  //  animation: `${slideDown} 300ms ease-out`,
  // },
  // '&[data-state=closed]': {
  //  animation: `${slideUp} 300ms ease-out`,
  // },
});
// const slideDown = keyframes`
//  from {
//    height: 0;
//  }
//  to {
//    height: var(--radix-collapsible-content-height),
//  }
// `;
// const slideUp = keyframes`
//  from {
//    height: var(--radix-collapsible-content-height);
//  }
//  to {
//    height: 0,
//  }
// `;

type FormulaHelperState = {
  expanded: Set<string>;
  setExpanded: (key: string, isExpanded: boolean) => void;
};

const useFormulaHelperStore = create<FormulaHelperState>()(
  persist(
    (set, get) => ({
      expanded: new Set(),
      setExpanded: (key: string, isExpanded: boolean) => {
        const { expanded } = get();
        if (isExpanded) expanded.add(key);
        else expanded.delete(key);
        set({ expanded });
      },
    }),
    {
      name: 'formula-helper',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const existingValue = JSON.parse(str);
          return {
            ...existingValue,
            state: {
              ...existingValue.state,
              expanded: new Set(existingValue.state.expanded),
            },
          };
        },
        setItem: (name, newValue: StorageValue<FormulaHelperState>) => {
          // functions cannot be JSON encoded
          const str = JSON.stringify({
            ...newValue,
            state: {
              ...newValue.state,
              expanded: Array.from(newValue.state.expanded.keys()),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

const FormulaHelper: FC<SidebarComponentProps> = (_props) => {
  const [sidebar] = useNotebookMetaData((s) => [s.sidebarComponent]);

  const [search, setSearch] = useState('');

  const [expanded, setExpanded] = useFormulaHelperStore((s) => [
    s.expanded,
    s.setExpanded,
  ]);

  const computer = useComputer();

  const definedNames = computer.getNamesDefined$.use();
  const customFunctions: FormulaItemProps['ident'][] = useMemo(() => {
    return definedNames
      .filter((name) => name.kind === 'function')
      .map((item) => {
        // eslint-disable-next-line no-param-reassign
        (item as FormulaItemProps['ident']).custom = true;
        return item;
      }) satisfies FormulaItemProps['ident'][];
  }, [definedNames]);

  const filteredIdents = useMemo(() => {
    const combined = [
      ['Custom Functions', customFunctions],
      ...Object.entries(builtInIdentifiers),
    ] satisfies [string, AutocompleteName[]][];
    return combined.map(
      ([group, idents]) =>
        [
          group,
          idents.filter(
            (ident) =>
              ident.name
                .toLocaleLowerCase()
                .indexOf(search.toLocaleLowerCase()) !== -1
          ),
        ] satisfies [string, AutocompleteName[]]
    );
  }, [customFunctions, search]);

  const insertOrWrapSelected = useCallback(
    (ident: AutocompleteName) => {
      if (sidebar.type !== 'formula-helper' || !sidebar.editor) return;
      const { editor } = sidebar;
      const selection = editor.lastRealSelection;
      if (!selection) return;
      if (selection.anchor.path[0] !== 0 || selection.focus.path[0] !== 0)
        // This really shouldn't be possible
        return;

      // since there should only be two nodes at this level, if we aren't on the 2nd node,
      // we must be too far back - so we clip to the earliest valid position
      if (selection.anchor.path[1] !== 1) {
        selection.anchor = {
          path: [0, 1, 0],
          offset: 0,
        };
      }
      if (selection.focus.path[1] !== 1) {
        selection.focus = {
          path: [0, 1, 0],
          offset: 0,
        };
      }

      editor.insertOrWrapFunction(ident.name, {
        at: selection,
      });
    },
    [sidebar]
  );

  if (sidebar.type !== 'formula-helper' || sidebar.editor === undefined) {
    return <></>;
  }
  return (
    <IdentifierWrapper>
      <IdentifierSearch>
        <MagnifyingGlass />
        <InputField
          type="text"
          placeholder="Search"
          size="small"
          value={search}
          onChange={setSearch}
        />
      </IdentifierSearch>
      <ul>
        {filteredIdents.map(([group, idents]) => {
          if (idents.length === 0) return <li key={`group[${group}]`}></li>;
          return (
            <li key={`group-${group}`}>
              <IdentifierGroup>{group}</IdentifierGroup>
              <ul>
                {idents.map((ident) => {
                  return (
                    <FormulaItem
                      key={`ident-${ident.name}`}
                      startOpen={expanded.has(ident.name)}
                      onOpenChange={(open) => {
                        setExpanded(ident.name, open);
                      }}
                      ident={ident}
                      onInsert={(i) => {
                        setExpanded(i.name, false);
                        insertOrWrapSelected(i);
                      }}
                    />
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </IdentifierWrapper>
  );
};

type FormulaItemProps = {
  startOpen?: boolean;
  ident: AutocompleteName & { custom?: boolean };
  onInsert?: (ident: AutocompleteName) => void;
  onOpenChange?: (open: boolean) => void;
};
const FormulaItem: FC<FormulaItemProps> = (props) => {
  const [open, setOpen] = useState(!!props.startOpen);
  return (
    <Collapsible.Root
      asChild
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        props.onOpenChange && props.onOpenChange(isOpen);
      }}
    >
      <IdentifierEntry key={`ident-${props.ident.name}`}>
        <Collapsible.Trigger asChild>
          <FormulaButton>
            {props.ident.formulaGroup && iconMap[props.ident.formulaGroup]}
            <span>
              {props.ident.name}(){props.ident.custom ? '*' : ''}
            </span>
            <span>{open ? <CaretUp /> : <CaretDown />}</span>
          </FormulaButton>
        </Collapsible.Trigger>
        <Collapsible.Content asChild>
          <IdentifierDescriptionWrapper className="CollapsibleContent">
            {props.ident.explanation && (
              <h1 className={props.ident.explanation ? '' : 'unknown'}>
                {props.ident.explanation ?? 'No explanation available.'}
              </h1>
            )}
            {props.ident.syntax && <pre>{props.ident.syntax}</pre>}

            {props.ident.example && (
              <>
                <h2>Example</h2>
                <pre>{props.ident.example}</pre>
              </>
            )}
            <Button
              size="extraSlim"
              type="text"
              onClick={() => {
                setOpen(false);
                props.onInsert && props.onInsert(props.ident);
              }}
            >
              Insert
            </Button>
          </IdentifierDescriptionWrapper>
        </Collapsible.Content>
      </IdentifierEntry>
    </Collapsible.Root>
  );
};

const FormulaButton = forwardRef<
  HTMLButtonElement,
  HTMLProps<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      {...(props as any)}
      ref={ref}
      css={css([
        btnStyles.styles,
        btnStyles.typeStyles.minimal[props.disabled ? 'disabled' : 'enabled'],
        btnStyles.sizeStyles.extraExtraSlim,
        props.disabled ? btnStyles.disabledStyles : btnStyles.enabledStyles,
      ])}
    />
  );
});

export default FormulaHelper;
