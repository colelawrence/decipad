/* eslint-disable no-param-reassign */
import {
  RemoteComputer,
  SerializedType,
  isColumn,
  isTable,
} from '@decipad/remote-computer';
import { encodingFor } from './plotUtils';
import { PlotSpec } from './plotUtils.interface';

type KindSet = Set<SerializedType['kind']>;

type ExclusionList = Array<string | { repeat: string } | undefined>;

const quantitativeKinds: KindSet = new Set(['number', 'date']);

const nominalKinds: KindSet = new Set(['string', 'boolean']);

const firstColumnInKind = (
  type: SerializedType,
  kinds: KindSet,
  exclude: ExclusionList = []
): [string, SerializedType] | undefined => {
  if (!isTable(type)) {
    return undefined;
  }
  let columnIndex = -1;
  for (const columnType of type.columnTypes) {
    columnIndex += 1;
    const columnName = type.columnNames[columnIndex];
    if (exclude.indexOf(columnName) >= 0) {
      continue;
    }
    if (isColumn(columnType) && kinds.has(columnType.cellType.kind)) {
      return [type.columnNames[columnIndex], columnType.cellType];
    }
  }
  return undefined;
};

const firstQuantitativeColumn = (
  type: SerializedType,
  exclude?: ExclusionList
) => firstColumnInKind(type, quantitativeKinds, exclude);

const firstNominalColumn = (type: SerializedType, exclude?: ExclusionList) =>
  firstColumnInKind(type, nominalKinds, exclude);

export const defaultPlotSpec = (
  computer: RemoteComputer,
  type: undefined | SerializedType,
  spec: PlotSpec | undefined
): PlotSpec | undefined => {
  if (!isTable(type) || !spec) {
    return spec;
  }
  // pie charts
  if (spec.mark.type === 'arc') {
    const exclude: ExclusionList = [];
    if (!spec.encoding.theta) {
      const column = firstQuantitativeColumn(type, exclude);
      if (column) {
        exclude.push(column[0]);
        spec.encoding.theta = encodingFor(computer, ...column, spec.mark.type);
      }
    }
    if (!spec.encoding.color) {
      const column = firstNominalColumn(type, exclude);
      if (column) {
        spec.encoding.theta = encodingFor(computer, ...column, spec.mark.type);
      }
    }

    // break here, as pie charts dont need more encodings
    return spec;
  }

  if (!spec.encoding.x) {
    const exclusions = [
      spec.encoding.y?.field,
      spec.encoding.size?.field,
      spec.encoding.color?.field,
    ];
    const column =
      firstNominalColumn(type, exclusions) ||
      firstQuantitativeColumn(type, exclusions);
    if (column) {
      spec.encoding.x = encodingFor(computer, ...column, spec.mark.type);
    }
  }

  if (!spec.encoding.y) {
    const exclusions = [
      spec.encoding.x?.field,
      spec.encoding.size?.field,
      spec.encoding.color?.field,
    ];
    const column =
      firstQuantitativeColumn(type, exclusions) ||
      firstNominalColumn(type, exclusions);
    if (column) {
      spec.encoding.y = encodingFor(computer, ...column, spec.mark.type);
    }
  }

  if (!spec.encoding.y) {
    const column = firstQuantitativeColumn(type) || firstNominalColumn(type);
    if (column) {
      spec.encoding.y = encodingFor(computer, ...column, spec.mark.type);
    }
  }

  return spec;
};
