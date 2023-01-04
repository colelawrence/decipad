import { baseSwatches } from './swatches';

export const ColorStatusNames = {
  draft: 'Draft',
  review: 'Review',
  approval: 'Approval',
  done: 'Done',
} as const;
export type TColorStatus = keyof typeof ColorStatusNames;
export const TColorKeys = Object.keys(ColorStatusNames);

export const statusColors = {
  draft: baseSwatches.Malibu,
  review: baseSwatches.Perfume,
  approval: baseSwatches.Grapefruit,
  done: baseSwatches.Sulu,
};

export const AvailableColorStatus: TColorStatus[] = Object.keys(
  statusColors
) as TColorStatus[];
