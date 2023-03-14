import { css } from '@emotion/react';
import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import {
  Brush,
  List,
  Plot,
  Settings,
  Table,
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  ScatterPlot,
} from '../../icons';
import { MenuList } from '../../molecules';
import {
  colorSchemes,
  monochromeColorSchemes,
  multicolorColorSchemes,
  cssVar,
  grey400,
  p13Medium,
} from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';

type StringSetter<T extends string | undefined = string> = (str: T) => void;

export const markTypes = ['line', 'bar', 'arc', 'area', 'point'] as const;

export type MarkType = typeof markTypes[number];

export const markTypeNames: Record<MarkType, string> = {
  bar: 'Bar',
  line: 'Line',
  point: 'Scatter',
  area: 'Area',
  arc: 'Pie',
};

export const markTypeIcons: Record<MarkType, ReactNode> = {
  bar: <BarChart />,
  line: <LineChart />,
  point: <ScatterPlot />,
  arc: <PieChart />,
  area: <AreaChart />,
};

export const shapes = ['point', 'circle', 'square', 'tick'];

export interface PlotParamsProps {
  readonly sourceVarName: string;
  readonly sourceVarNameOptions: ReadonlyArray<string>;
  readonly sourceExprRefOptions?: ReadonlyArray<string>;
  readonly setSourceVarName: StringSetter;
  readonly markType: MarkType;
  readonly setMarkType: StringSetter;
  readonly columnNameOptions: ReadonlyArray<string>;
  readonly xColumnName: string;
  readonly setXColumnName: StringSetter;
  readonly yColumnName: string;
  readonly setYColumnName: StringSetter;
  readonly sizeColumnName: string;
  readonly setSizeColumnName: StringSetter;
  readonly colorColumnName: string;
  readonly setColorColumnName: StringSetter;
  readonly thetaColumnName: string;
  readonly setThetaColumnName: StringSetter;
  readonly colorScheme?: string;
  readonly setColorScheme: StringSetter;
  readonly shape: string;
  readonly setShape: StringSetter;
}

const wrapperContainerStyles = css({
  marginBottom: '20px',
});

const buttonStyles = css({
  borderRadius: '6px',
  border: `1px solid ${cssVar('borderColor')}`,
  backgroundColor: cssVar('tintedBackgroundColor'),

  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
  },
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '4px',
});

const iconStyles = css({
  width: '12px',
});

const buttonTextStyles = css(p13Medium, {
  whiteSpace: 'nowrap',
  padding: '0 4px',
});

type SubMenuKey =
  | 'source-table'
  | 'chart-type'
  | 'shape'
  | 'colors'
  | 'color-scheme'
  | 'slice-size'
  | 'label'
  | 'value'
  | 'point-size'
  | 'color-scheme_monochrome'
  | 'color-scheme_multicolor';

type ColorSchemeUniqueName = keyof typeof colorSchemes;

const getColorSchemePrettyName = (uniqueName: ColorSchemeUniqueName) => {
  const cs = colorSchemes[uniqueName];
  // When this function is called we cheat and coerce a string to `ColorSchemeUniqueName` so we
  // have to check whether cs exists even though the type system thinks it definitely should!
  return cs ? `${cs.category} ${cs.name}` : '';
};

export const PlotParams = ({
  sourceVarName,
  sourceVarNameOptions,
  sourceExprRefOptions,
  columnNameOptions,
  setSourceVarName,
  markType,
  setMarkType,
  xColumnName,
  setXColumnName,
  yColumnName,
  setYColumnName,
  sizeColumnName,
  setSizeColumnName,
  colorColumnName,
  setColorColumnName,
  thetaColumnName,
  setThetaColumnName,
  colorScheme,
  setColorScheme,
  shape,
  setShape,
}: PlotParamsProps): ReturnType<FC> => {
  const [open, setOpen] = useState<SubMenuKey | null>(null);

  const onChangeOpen = useCallback(
    (key: SubMenuKey) => (isOpen: boolean) => {
      // Have to check menu is definitely opening or this will be reset to the key when
      // the main menu closes and reopen the submenu!
      if (isOpen) {
        setOpen(key);
      }
    },
    [setOpen]
  );

  const [tempColorScheme, setTempColorScheme] = useState<string | undefined>(
    undefined
  );
  const [cachedColorScheme, setCachedColorScheme] = useState<
    string | undefined
  >(colorScheme);

  useEffect(() => {
    if (tempColorScheme) {
      setColorScheme(tempColorScheme);
    } else if (cachedColorScheme) {
      setColorScheme(cachedColorScheme);
    }
  }, [tempColorScheme, cachedColorScheme, setColorScheme]);

  const tableExpressionRefIndex = sourceExprRefOptions?.indexOf(sourceVarName);
  const tableVarName =
    tableExpressionRefIndex === undefined
      ? undefined
      : sourceVarNameOptions[tableExpressionRefIndex];

  useEffect(() => {
    // We can't set sensible defaults without these two, so we just return
    if (!tableVarName) return;
    if (columnNameOptions.length < 2) return;

    // Not used for everything, but doesn't hurt to set it anyway
    if (!colorScheme) {
      setColorScheme('multicolor_yellow');
    }

    // When a new chart is created, pick some sensible defaults once we kow what type of chart it's meant to be
    switch (markType) {
      case 'arc': {
        if (!colorColumnName) {
          setColorColumnName(columnNameOptions[0]);
        }
        if (!thetaColumnName) {
          setThetaColumnName(columnNameOptions[1]);
        }
        break;
      }
      case 'bar':
      case 'area':
      case 'point':
      case 'line': {
        if (!xColumnName) {
          setXColumnName(columnNameOptions[0]);
        }
        if (!yColumnName) {
          setYColumnName(columnNameOptions[1]);
        }
        break;
      }
    }
  }, [
    tableVarName,
    markType,
    colorColumnName,
    colorScheme,
    columnNameOptions,
    setColorColumnName,
    setColorScheme,
    setThetaColumnName,
    setXColumnName,
    setYColumnName,
    thetaColumnName,
    xColumnName,
    yColumnName,
  ]);

  return (
    <div css={[wrapperContainerStyles, hideOnPrint]}>
      <MenuList
        root
        dropdown
        onChangeOpen={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
          }
        }}
        // Width hard coded to deal with "Monochrome Yellow", the longest color name :(
        styles={css({ width: '290px' })}
        dataTestid="chart-settings-menu"
        trigger={
          <button css={buttonStyles} data-testid="chart-settings-button">
            <span css={iconStyles}>{<Settings />}</span>
            <span css={buttonTextStyles}>Settings</span>
          </button>
        }
      >
        <MenuList
          key="source-table"
          open={open === 'source-table'}
          onChangeOpen={onChangeOpen('source-table')}
          itemTrigger={
            <TriggerMenuItem
              icon={<Table />}
              selectedPreview={tableVarName?.toString()}
            >
              Source table
            </TriggerMenuItem>
          }
        >
          {sourceVarNameOptions.map((svn, index) => {
            return (
              <MenuItem
                key={svn}
                selected={sourceExprRefOptions?.[index] === sourceVarName}
                onSelect={() => {
                  setSourceVarName(sourceExprRefOptions?.[index] ?? svn);
                }}
              >
                <div css={{ minWidth: '160px' }}>{svn}</div>
              </MenuItem>
            );
          })}
        </MenuList>
        <MenuList
          key="chart-type"
          open={open === 'chart-type'}
          onChangeOpen={onChangeOpen('chart-type')}
          itemTrigger={
            <TriggerMenuItem
              icon={<Plot />}
              selectedPreview={markTypeNames[markType]}
            >
              Chart type
            </TriggerMenuItem>
          }
        >
          {markTypes.map((mark) => {
            const type = shapes.includes(mark) ? 'point' : mark;

            return (
              <MenuItem
                key={type}
                selected={markType === mark}
                onSelect={() => setMarkType(type)}
                icon={markTypeIcons[mark]}
                data-testid={`chart__settings__chart-type__${mark}`}
              >
                <div css={{ minWidth: '160px' }}>{markTypeNames[mark]}</div>
              </MenuItem>
            );
          })}
        </MenuList>
        {shapes.includes(markType) && (
          <MenuList
            key="shape"
            open={open === 'shape'}
            onChangeOpen={onChangeOpen('shape')}
            itemTrigger={
              <TriggerMenuItem selectedPreview={shape}>Shape</TriggerMenuItem>
            }
          >
            {shapes.map((s) => {
              return (
                <MenuItem
                  key={s}
                  selected={shape === s}
                  onSelect={() => {
                    setShape(s);
                  }}
                >
                  <div css={{ minWidth: '160px' }}>{s}</div>
                </MenuItem>
              );
            })}
          </MenuList>
        )}
        {(markType === 'bar' || markType === 'arc') && (
          <MenuList
            key="colors"
            open={open === 'colors'}
            onChangeOpen={onChangeOpen('colors')}
            itemTrigger={
              <TriggerMenuItem
                icon={<List />}
                selectedPreview={colorColumnName}
              >
                Colors
              </TriggerMenuItem>
            }
          >
            {columnNameOptions.map((columnNameOption) => {
              return (
                <MenuItem
                  key={columnNameOption}
                  selected={colorColumnName === columnNameOption}
                  onSelect={() => setColorColumnName(columnNameOption)}
                >
                  <div css={{ minWidth: '160px' }}>{columnNameOption}</div>
                </MenuItem>
              );
            })}
          </MenuList>
        )}

        {markType === 'arc' && (
          <MenuList
            key="slice-size"
            open={open === 'slice-size'}
            onChangeOpen={onChangeOpen('slice-size')}
            itemTrigger={
              <TriggerMenuItem
                icon={<List />}
                selectedPreview={thetaColumnName}
              >
                Slice size
              </TriggerMenuItem>
            }
          >
            {columnNameOptions.map((columnNameOption) => (
              <MenuItem
                key={columnNameOption}
                selected={thetaColumnName === columnNameOption}
                onSelect={() => setThetaColumnName(columnNameOption)}
              >
                <div css={{ minWidth: '160px' }}>{columnNameOption}</div>
              </MenuItem>
            ))}
          </MenuList>
        )}

        {(markType === 'bar' || markType === 'arc') && colorColumnName && (
          <MenuList
            key="color-scheme"
            open={open?.startsWith('color-scheme')}
            onChangeOpen={onChangeOpen('color-scheme')}
            itemTrigger={
              <TriggerMenuItem
                icon={<Brush />}
                selectedPreview={getColorSchemePrettyName(
                  colorScheme as keyof typeof colorSchemes
                )}
              >
                Color scheme
              </TriggerMenuItem>
            }
          >
            <MenuList
              key="monochrome-color-scheme"
              open={open === 'color-scheme_monochrome'}
              onChangeOpen={onChangeOpen('color-scheme_monochrome')}
              itemTrigger={
                <TriggerMenuItem icon={<Brush />}>Monochrome</TriggerMenuItem>
              }
            >
              {monochromeColorSchemes.map(([uniqueName, cs]) => (
                <MenuItem
                  key={uniqueName}
                  selected={uniqueName === colorScheme}
                  onSelect={() => {
                    setColorScheme(uniqueName);
                    setCachedColorScheme(uniqueName);
                  }}
                  onMouseEnter={() => {
                    setTempColorScheme(uniqueName);
                  }}
                  onMouseLeave={() => {
                    setTempColorScheme(undefined);
                  }}
                >
                  <div css={{ minWidth: '160px' }}>{cs.name}</div>
                </MenuItem>
              ))}
            </MenuList>
            <MenuList
              key="multicolor-color-scheme"
              open={open === 'color-scheme_multicolor'}
              onChangeOpen={onChangeOpen('color-scheme_multicolor')}
              itemTrigger={
                <TriggerMenuItem icon={<Brush />}>Multicolor</TriggerMenuItem>
              }
            >
              {multicolorColorSchemes.map(([uniqueName, cs]) => (
                <MenuItem
                  key={uniqueName}
                  selected={uniqueName === colorScheme}
                  onSelect={() => {
                    setColorScheme(uniqueName);
                    setCachedColorScheme(uniqueName);
                  }}
                  onMouseEnter={() => {
                    setTempColorScheme(uniqueName);
                  }}
                  onMouseLeave={() => {
                    setTempColorScheme(undefined);
                  }}
                >
                  <div css={{ minWidth: '160px' }}>{cs.name}</div>
                </MenuItem>
              ))}
            </MenuList>
          </MenuList>
        )}
        {markType !== 'arc' && (
          <>
            <MenuList
              key="label"
              open={open === 'label'}
              onChangeOpen={onChangeOpen('label')}
              itemTrigger={
                <TriggerMenuItem icon={<List />} selectedPreview={xColumnName}>
                  Label
                </TriggerMenuItem>
              }
            >
              {columnNameOptions.map((columnNameOption) => (
                <MenuItem
                  key={columnNameOption}
                  onSelect={() => setXColumnName(columnNameOption)}
                  data-testid={`chart__settings__label__${columnNameOption}`}
                >
                  <div css={{ minWidth: '160px' }}>{columnNameOption}</div>
                </MenuItem>
              ))}
            </MenuList>
            <MenuList
              key="value"
              open={open === 'value'}
              onChangeOpen={onChangeOpen('value')}
              itemTrigger={
                <TriggerMenuItem icon={<List />} selectedPreview={yColumnName}>
                  Value
                </TriggerMenuItem>
              }
            >
              {columnNameOptions.map((columnNameOption) => (
                <MenuItem
                  key={columnNameOption}
                  onSelect={() => setYColumnName(columnNameOption)}
                  data-testid={`chart__settings__value__${columnNameOption}`}
                >
                  <div css={{ minWidth: '160px' }}>{columnNameOption}</div>
                </MenuItem>
              ))}
            </MenuList>
          </>
        )}
        {(shapes.includes(markType) || markType === 'area') && (
          <MenuList
            key="point-size"
            open={open === 'point-size'}
            onChangeOpen={onChangeOpen('point-size')}
            itemTrigger={
              <TriggerMenuItem icon={<List />} selectedPreview={sizeColumnName}>
                Point size
              </TriggerMenuItem>
            }
          >
            <MenuItem key="" onSelect={() => setSizeColumnName('')}>
              <div
                css={{ minWidth: '160px', height: '19px', color: grey400.rgb }}
              >
                None
              </div>
            </MenuItem>
            {columnNameOptions.map((columnNameOption) => (
              <MenuItem
                key={columnNameOption}
                onSelect={() => setSizeColumnName(columnNameOption)}
              >
                <div css={{ minWidth: '160px' }}>{columnNameOption}</div>
              </MenuItem>
            ))}
          </MenuList>
        )}
      </MenuList>
    </div>
  );
};
