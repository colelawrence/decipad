export interface Dimension {
  dimensionLength: number | (() => Promise<number>);
}
