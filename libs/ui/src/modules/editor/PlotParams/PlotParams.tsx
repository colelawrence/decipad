/* eslint-disable complexity */
import {
  PlotDefaultColorScheme,
  markTypes,
  markTypesThatCanFlip,
} from '@decipad/editor-types';
import { css } from '@emotion/react';
import { Checkbox } from 'libs/ui/src/shared/atoms/Checkbox/Checkbox';
import { getTypeIcon } from 'libs/ui/src/utils';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import _ from 'lodash';
import {
  Add,
  BarChart,
  Brush,
  Hashtag,
  LineChart,
  List,
  Settings,
  TableSmall,
  Transpose,
  Trash,
  ZeroChart,
} from '../../../icons';
import {
  monochromeColorSchemes,
  multicolorColorSchemes,
} from '../../../primitives';
import { Divider, MenuItem, MenuList, TriggerMenuItem } from '../../../shared';
import ColorSchemeMenu from './ColorSchemeMenu';
import { ColumnActionItem } from './ColumnActionItem';
import { TablePicker } from './TablePicker';
import { ToggleMenuItem } from './ToggleMenuItem';
import { getInitialAxes, optionsForChartStyle } from './helpers';
import {
  buttonStyles,
  constMenuMinWidth,
  iconStyles,
  plotParamsWrapperStyles,
  soonStyles,
} from './styles';
import {
  ColumnActionButton,
  PlotParamsProps,
  SubMenuKey,
  markTypeIcons,
  markTypeIsDisabled,
  markTypeNames,
} from './types';

export const PlotParams = ({
  sourceVarName,
  sourceVarNameOptions,
  sourceExprRefOptions,
  columnNameOptions,
  columnTypeOptions,
  setSourceVarName,
  markType,
  setMarkType,
  xColumnName,
  setXColumnName,
  sizeColumnName,
  setSizeColumnName,
  colorScheme,
  setColorScheme,
  orientation,
  setOrientation,
  grid,
  setGrid,
  showDataLabel,
  setShowDataLabel,
  startFromZero,
  setStartFromZero,
  groupByX,
  setGroupByX,
  lineVariant,
  setLineVariant,
  arcVariant,
  setArcVariant,
  barVariant,
  setBarVariant,
  mirrorYAxis,
  setMirrorYAxis,
  flipTable,
  setFlipTable,
  labelColumnName,
  setLabelColumnName,
  setYColumnNames,
  yColumnNames,
  setYColumnChartTypes,
  setXAxisLabel,
  setYAxisLabel,
  yColumnChartTypes,
}: PlotParamsProps): ReturnType<FC> => {
  const [open, setOpen] = useState<SubMenuKey | null>(null);
  const [initValues, setInitValues] = useState(false);
  const [initValuesForFlipping, setInitValuesForFlipping] = useState(false);

  const currentVariant = useMemo(() => {
    return markType === 'line'
      ? lineVariant
      : markType === 'bar'
      ? barVariant
      : arcVariant;
  }, [barVariant, lineVariant, markType, arcVariant]);

  const onChangeOpen = useCallback(
    (key: SubMenuKey) => (isOpen: boolean) => {
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
  }, [tempColorScheme, cachedColorScheme, setColorScheme, columnNameOptions]);

  const tableExpressionRefIndex = sourceVarName
    ? sourceExprRefOptions?.indexOf(sourceVarName)
    : undefined;
  const tableVarName =
    tableExpressionRefIndex === undefined
      ? undefined
      : sourceVarNameOptions[tableExpressionRefIndex];

  useEffect(() => {
    if (initValuesForFlipping) {
      return;
    }
    if (
      flipTable &&
      markTypesThatCanFlip.includes(markType) &&
      columnNameOptions.length > 0
    ) {
      setXColumnName('Key');
      setYColumnNames([columnNameOptions[1]]);
      setInitValuesForFlipping(true);
    }
  }, [
    columnNameOptions,
    flipTable,
    initValuesForFlipping,
    markType,
    setXColumnName,
    setYColumnNames,
  ]);

  useEffect(() => {
    if (!flipTable && initValuesForFlipping) {
      setXColumnName('');
      setYColumnNames([]);
      setInitValuesForFlipping(false);
      setInitValues(false);
    }
  }, [flipTable, initValuesForFlipping, setXColumnName, setYColumnNames]);

  useEffect(() => {
    if (initValues) {
      return;
    }
    if (!tableVarName) return;
    if (columnNameOptions.length < 2) return;

    if (!colorScheme) {
      setColorScheme(PlotDefaultColorScheme);
    }

    if (markType === 'funnel') {
      setShowDataLabel(true);
    }

    switch (markType) {
      case 'arc':
      case 'bar':
      case 'area':
      case 'point':
      case 'line':
      case 'funnel':
      case 'radar':
      case 'combo':
        const { initialX, initialY } = getInitialAxes(
          columnNameOptions,
          columnTypeOptions,
          markType === 'point'
        );

        if (!xColumnName) {
          setXColumnName(initialX);
        }
        if (yColumnNames.length === 0 && initialY) {
          setYColumnNames([initialY]);
          setYColumnChartTypes(['bar']);
        }

        break;
    }
    setInitValues(true);
  }, [
    colorScheme,
    columnNameOptions,
    columnTypeOptions,
    flipTable,
    initValues,
    markType,
    setColorScheme,
    setInitValues,
    setShowDataLabel,
    setXColumnName,
    setYColumnChartTypes,
    setYColumnNames,
    tableVarName,
    xColumnName,
    yColumnNames,
    yColumnNames.length,
  ]);

  const onToggleValue = useCallback(
    (columnName: string) => {
      if (yColumnNames.includes(columnName)) {
        setYColumnNames(yColumnNames.filter((name) => name !== columnName));
      } else {
        setYColumnNames([...yColumnNames, columnName]);
      }
      setYColumnChartTypes([...yColumnChartTypes, 'bar']);
    },
    [setYColumnChartTypes, setYColumnNames, yColumnChartTypes, yColumnNames]
  );

  const onChangeXValue = (newX: string) => {
    setXColumnName(newX);
    setYColumnNames([]);
    setYColumnChartTypes([]);
  };

  const onToggleOrientation = () => {
    setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal');
  };

  const onToggleGrid = () => {
    setGrid(!grid);
  };

  const onToggleDataLabels = () => {
    setShowDataLabel(!showDataLabel);
  };

  const onToggleStartFromZero = () => {
    setStartFromZero(!startFromZero);
  };

  const onToggleMirrorYAxis = () => {
    setMirrorYAxis(!mirrorYAxis);
  };

  const onToggleFlipTable = () => {
    setFlipTable(!flipTable);
  };

  const onToggleGroupByX = () => {
    setGroupByX(!groupByX);
  };

  const resetChart = useCallback(() => {
    setLabelColumnName('');
    setYColumnNames([]);
    setYColumnChartTypes(['bar']);
    setBarVariant('grouped');
    setLineVariant('simple');
    setArcVariant('simple');
    setOrientation('horizontal');
    setGrid(true);
    setStartFromZero(true);
    setGroupByX(false);
    setShowDataLabel(false);
    setYAxisLabel('');
    setXAxisLabel('');
    setInitValues(false);
  }, [
    setLabelColumnName,
    setYColumnNames,
    setYColumnChartTypes,
    setBarVariant,
    setLineVariant,
    setArcVariant,
    setOrientation,
    setGrid,
    setStartFromZero,
    setGroupByX,
    setShowDataLabel,
    setYAxisLabel,
    setXAxisLabel,
  ]);

  const availableColumns = useMemo(
    () =>
      columnNameOptions.filter(
        (columnNameOption) =>
          columnNameOption !== xColumnName &&
          !yColumnNames.includes(columnNameOption)
      ),
    [columnNameOptions, xColumnName, yColumnNames]
  );

  const availableTypes = useMemo(
    () =>
      columnTypeOptions.filter(
        (__, index) =>
          columnNameOptions[index] !== xColumnName &&
          !yColumnNames.includes(columnNameOptions[index])
      ),
    [columnTypeOptions, columnNameOptions, xColumnName, yColumnNames]
  );

  const hasColumnsAvailable = useMemo(
    () => availableColumns.length !== 0,
    [availableColumns.length]
  );

  const renderColumnOptions = useCallback(
    ({
      onChange,
      testIdPrefix,
      preventDefault = false,
      filterAlreadyChoseColumns = false,
    }: {
      onChange: (newValue: string) => void;
      testIdPrefix: string;
      preventDefault?: boolean;
      filterAlreadyChoseColumns?: boolean;
    }) => {
      return (
        filterAlreadyChoseColumns ? availableColumns : columnNameOptions
      ).map((columnNameOption, i) => {
        const typesForMenu = filterAlreadyChoseColumns
          ? availableTypes
          : columnTypeOptions;
        const TypeIcon = getTypeIcon(typesForMenu[i]);
        return (
          <MenuItem
            key={columnNameOption}
            icon={<TypeIcon />}
            onSelect={(ev) => {
              if (preventDefault) {
                ev.preventDefault();
              }
              onChange(columnNameOption);
            }}
            data-testid={`${testIdPrefix}__${columnNameOption}`}
          >
            <div css={constMenuMinWidth}>{columnNameOption}</div>
          </MenuItem>
        );
      });
    },
    [availableColumns, availableTypes, columnNameOptions, columnTypeOptions]
  );

  const onMakeColumnLineType = useCallback(
    (columnName: string) => {
      const newChartTypes = yColumnNames.map((name, index) =>
        name === columnName ? 'line' : yColumnChartTypes[index]
      );
      setYColumnChartTypes(newChartTypes);
    },
    [setYColumnChartTypes, yColumnChartTypes, yColumnNames]
  );

  const onMakeColumnBarType = useCallback(
    (columnName: string) => {
      const newChartTypes = yColumnNames.map((name, index) =>
        name === columnName ? 'bar' : yColumnChartTypes[index]
      );
      setYColumnChartTypes(newChartTypes);
    },
    [setYColumnChartTypes, yColumnChartTypes, yColumnNames]
  );

  const selectedChartTypeFor = useCallback(
    (columnName: string) => {
      const index = yColumnNames.indexOf(columnName);
      return index !== -1 ? yColumnChartTypes[index] : 'bar';
    },
    [yColumnChartTypes, yColumnNames]
  );

  const getColumnActionButtons = useMemo(
    () => (columnName: string) => {
      const buttons: ColumnActionButton[] = [
        {
          icon: <Trash />,
          label: 'Delete',
          onSelect: () => onToggleValue(columnName),
          type: 'simple',
        },
      ];

      if (markType === 'combo') {
        buttons.unshift({
          type: 'combo',
          selected: selectedChartTypeFor(columnName),
          options: [
            {
              icon: <LineChart />,
              label: 'line',
              onSelect: () => onMakeColumnBarType(columnName),
            },
            {
              icon: <BarChart />,
              label: 'bar',
              onSelect: () => onMakeColumnLineType(columnName),
            },
          ],
        });
      }

      return buttons;
    },
    [
      markType,
      onMakeColumnBarType,
      onMakeColumnLineType,
      onToggleValue,
      selectedChartTypeFor,
    ]
  );

  return (
    <div css={plotParamsWrapperStyles}>
      <MenuList
        root
        dropdown
        onChangeOpen={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
          }
        }}
        styles={css({ width: '290px' })}
        dataTestid="chart-settings-menu"
        trigger={
          <button css={buttonStyles} data-testid="chart-settings-button">
            <span css={iconStyles}>{<Settings />}</span>
          </button>
        }
      >
        {!sourceVarName ? (
          <TablePicker
            sourceVarNameOptions={sourceVarNameOptions}
            sourceExprRefOptions={sourceExprRefOptions}
            setSourceVarName={setSourceVarName}
            resetChart={resetChart}
          />
        ) : (
          <>
            <MenuList
              key="source-table"
              open={open === 'source-table'}
              onChangeOpen={onChangeOpen('source-table')}
              itemTrigger={
                <TriggerMenuItem
                  icon={<TableSmall />}
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
                      resetChart();
                      setSourceVarName(sourceExprRefOptions?.[index] ?? svn);
                    }}
                  >
                    <div css={constMenuMinWidth}>{svn}</div>
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
                  icon={<BarChart />}
                  selectedPreview={markTypeNames[markType]}
                >
                  Chart type
                </TriggerMenuItem>
              }
            >
              {markTypes.map((mark) => {
                return (
                  <MenuItem
                    key={mark}
                    selected={markType === mark}
                    disabled={markTypeIsDisabled[mark]}
                    onSelect={() => {
                      if (mark === 'arc') {
                        setYColumnNames([yColumnNames[0]]);
                        setYColumnChartTypes(['bar']);
                      }
                      setMarkType(mark);
                    }}
                    icon={markTypeIcons[mark]}
                    data-testid={`chart__settings__chart-type__${mark}`}
                  >
                    <div css={constMenuMinWidth}>
                      {markTypeNames[mark]}{' '}
                      {markTypeIsDisabled[mark] && (
                        <span css={soonStyles}>SOON</span>
                      )}
                    </div>
                  </MenuItem>
                );
              })}
            </MenuList>

            <ColorSchemeMenu
              onChangeOpen={onChangeOpen}
              open={open}
              selectedColorScheme={colorScheme || PlotDefaultColorScheme}
              setColorScheme={setColorScheme}
              setCachedColorScheme={setCachedColorScheme}
              setTempColorScheme={setTempColorScheme}
              monochromeColorSchemes={monochromeColorSchemes}
              multicolorColorSchemes={multicolorColorSchemes}
            />

            <MenuList
              key="label"
              open={open === 'label'}
              onChangeOpen={onChangeOpen('label')}
              itemTrigger={
                <TriggerMenuItem icon={<List />} selectedPreview={xColumnName}>
                  Category 𝑥
                </TriggerMenuItem>
              }
            >
              {renderColumnOptions({
                onChange: onChangeXValue,
                testIdPrefix: 'chart__settings__xcolumn',
              })}
            </MenuList>
            {(markType === 'line' ||
              markType === 'area' ||
              markType === 'bar' ||
              markType === 'arc' ||
              markType === 'radar' ||
              markType === 'combo') && (
              <ToggleMenuItem
                menuKey="group-by-category"
                icon={<Settings />}
                label="Group by category 𝑥"
                active={groupByX}
                onChange={onToggleGroupByX}
              />
            )}

            {markType === 'point' && (
              <MenuList
                key="scatterlabel"
                open={open === 'scatterlabel'}
                onChangeOpen={onChangeOpen('scatterlabel')}
                itemTrigger={
                  <TriggerMenuItem
                    icon={<List />}
                    selectedPreview={labelColumnName}
                  >
                    Tooltip Label
                  </TriggerMenuItem>
                }
              >
                <MenuItem
                  key={'label-none'}
                  onSelect={() => setLabelColumnName('')}
                  data-testid={`chart__settings__scatter_label__set_none`}
                >
                  <div css={constMenuMinWidth}>None</div>
                </MenuItem>
                {columnNameOptions.map((columnNameOption) => (
                  <MenuItem
                    key={columnNameOption}
                    onSelect={() => setLabelColumnName(columnNameOption)}
                    data-testid={`chart__settings__scatter_label__${columnNameOption}`}
                  >
                    <div css={constMenuMinWidth}>{columnNameOption}</div>
                  </MenuItem>
                ))}
              </MenuList>
            )}

            <Divider />
            <ColumnActionItem
              columnNames={yColumnNames}
              getButtons={getColumnActionButtons}
            />
            <>
              {(markType !== 'arc' ||
                (markType === 'arc' && yColumnNames.length !== 1)) &&
                hasColumnsAvailable &&
                (markType !== 'point' ||
                  (markType === 'point' && yColumnNames.length !== 1)) && (
                  <MenuList
                    key="addvalue"
                    open={open === 'addvalue'}
                    onChangeOpen={onChangeOpen('addvalue')}
                    itemTrigger={
                      <TriggerMenuItem icon={<Add />}>
                        Add Value 𝑦
                      </TriggerMenuItem>
                    }
                  >
                    {renderColumnOptions({
                      preventDefault: true,
                      filterAlreadyChoseColumns: true,
                      onChange: onToggleValue,
                      testIdPrefix: 'chart__settings__add_moar',
                    })}
                  </MenuList>
                )}
            </>
            <Divider />

            {markType === 'point' && (
              <MenuList
                key="point-size"
                open={open === 'point-size'}
                onChangeOpen={onChangeOpen('point-size')}
                itemTrigger={
                  <TriggerMenuItem
                    icon={<List />}
                    selectedPreview={sizeColumnName}
                  >
                    Point size
                  </TriggerMenuItem>
                }
              >
                <MenuItem key="" onSelect={() => setSizeColumnName('')}>
                  <div css={constMenuMinWidth}>None</div>
                </MenuItem>
                {columnNameOptions.map((columnNameOption) => (
                  <MenuItem
                    key={columnNameOption}
                    onSelect={() => setSizeColumnName(columnNameOption)}
                  >
                    <div css={constMenuMinWidth}>{columnNameOption}</div>
                  </MenuItem>
                ))}
              </MenuList>
            )}
            {(markType === 'line' ||
              markType === 'bar' ||
              markType === 'arc') && (
              <>
                <MenuList
                  key="chart-variant"
                  open={open === 'chart-variant'}
                  onChangeOpen={onChangeOpen('chart-variant')}
                  itemTrigger={
                    <TriggerMenuItem
                      icon={<Brush />}
                      selectedPreview={_.capitalize(currentVariant)}
                    >
                      Chart style
                    </TriggerMenuItem>
                  }
                >
                  {optionsForChartStyle(markType).map((opts, i) => (
                    <MenuItem
                      key={`chart-${opts.key}-${i}`}
                      icon={<Checkbox checked={currentVariant === opts.key} />}
                      onSelect={(e) => {
                        if (markType === 'line' && opts.type === 'line') {
                          setLineVariant(opts.key);
                        } else if (markType === 'bar' && opts.type === 'bar') {
                          setBarVariant(opts.key);
                        } else if (markType === 'arc' && opts.type === 'arc') {
                          setArcVariant(opts.key);
                        }
                        e.preventDefault();
                      }}
                      data-testid={`chart__settings__set_by__${opts.key}`}
                    >
                      <div css={constMenuMinWidth}>{opts.label}</div>
                    </MenuItem>
                  ))}
                </MenuList>
              </>
            )}
            {markType !== 'radar' && (
              <ToggleMenuItem
                menuKey="show-data-labels"
                icon={<Hashtag />}
                label="Data values"
                active={showDataLabel}
                onChange={onToggleDataLabels}
              />
            )}
            {(markType === 'line' ||
              markType === 'bar' ||
              markType === 'point' ||
              markType === 'funnel' ||
              markType === 'area' ||
              markType === 'combo') && (
              <ToggleMenuItem
                menuKey="flip-chart"
                icon={<Settings />}
                label="Vertical"
                active={orientation === 'vertical'}
                onChange={onToggleOrientation}
              />
            )}
            {(markType === 'line' ||
              markType === 'bar' ||
              markType === 'point' ||
              markType === 'area' ||
              markType === 'combo' ||
              markType === 'radar') && (
              <ToggleMenuItem
                menuKey="grid-option"
                icon={<Settings />}
                label="Grid line"
                active={grid}
                onChange={onToggleGrid}
              />
            )}
            {markType === 'funnel' && (
              <ToggleMenuItem
                menuKey="mirror-y-axis"
                icon={<Settings />}
                label="Mirror axis"
                active={mirrorYAxis}
                onChange={onToggleMirrorYAxis}
              />
            )}
            {markTypesThatCanFlip.includes(markType) && (
              <ToggleMenuItem
                menuKey="flip-table"
                icon={<Transpose />}
                label="Flip table"
                active={flipTable}
                onChange={onToggleFlipTable}
              />
            )}
            {(markType === 'line' ||
              markType === 'bar' ||
              markType === 'point' ||
              markType === 'area' ||
              markType === 'combo') && (
              <ToggleMenuItem
                menuKey="start-from-zero"
                icon={<ZeroChart />}
                label="Start from zero"
                active={startFromZero}
                onChange={onToggleStartFromZero}
              />
            )}
          </>
        )}
      </MenuList>
    </div>
  );
};
