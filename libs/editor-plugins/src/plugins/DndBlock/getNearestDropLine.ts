import type { DropLine } from './types';
import { partition } from 'lodash';
import { verticalDropLineThreshold } from './constants';

export const getNearestDropLine = (
  dropLines: DropLine[],
  referencePosition: { x: number; y: number }
): DropLine | null => {
  const getDropLineDistance = ({
    type,
    mainAxis,
    crossAxis,
    confineToCrossAxis,
  }: DropLine): number | null => {
    const [referenceMainAxis, referenceCrossAxis] =
      type === 'vertical'
        ? [referencePosition.x, referencePosition.y]
        : [referencePosition.y, referencePosition.x];

    const inBounds =
      !confineToCrossAxis ||
      (referenceCrossAxis > crossAxis.start &&
        referenceCrossAxis < crossAxis.end);

    if (!inBounds) return null;

    return Math.abs(mainAxis - referenceMainAxis);
  };

  const [verticalDropLines, horizontalDropLines] = partition(
    dropLines,
    (dropLine) => dropLine.type === 'vertical'
  );

  /**
   * If any vertical drop line is within verticalDropLineThreshold pixels,
   * return the first such drop line.
   */
  const nearestVerticalDropLine = verticalDropLines.find((dropLine) => {
    const distance = getDropLineDistance(dropLine);
    return distance !== null && distance < verticalDropLineThreshold;
  });

  if (nearestVerticalDropLine) return nearestVerticalDropLine;

  // Return the nearest horizontal drop line
  const nearestHorizontalDropLine: [DropLine, number] | null =
    horizontalDropLines.reduce((nearest, dropLine) => {
      const distance = getDropLineDistance(dropLine);
      if (distance === null) return nearest;

      if (!nearest || distance < nearest[1]) {
        return [dropLine, distance];
      }

      return nearest;
    }, null as [DropLine, number] | null);

  return nearestHorizontalDropLine && nearestHorizontalDropLine[0];
};
