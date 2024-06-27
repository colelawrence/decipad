export type AllowedPlotValue = string | boolean | number | Date;

export type Row = Record<string, AllowedPlotValue>;

export type PlotData = {
  table: Row[];
};
