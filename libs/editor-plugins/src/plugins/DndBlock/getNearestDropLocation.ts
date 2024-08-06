import type { DropArea, DropLine, DropLocation } from './types';
import { groupBy } from 'lodash';
import { verticalDropLineThreshold } from './constants';
import type { XYCoord } from 'react-dnd';

export const getNearestDropLocation = (
  dropLocations: DropLocation[],
  referencePosition: XYCoord
): DropLocation | null => {
  const {
    horizontalDropLine: horizontalDropLines = [],
    verticalDropLine: verticalDropLines = [],
    dropArea: dropAreas = [],
  } = groupBy(dropLocations, 'type') as {
    horizontalDropLine: DropLine[] | undefined;
    verticalDropLine: DropLine[] | undefined;
    dropArea: DropArea[] | undefined;
  };

  /**
   * If any vertical drop line is within verticalDropLineThreshold pixels,
   * return the first such drop line.
   */
  const verticalDropLine = verticalDropLines.find((dropLine) => {
    const distance = getDropLineDistance(referencePosition, dropLine);
    return distance !== null && distance < verticalDropLineThreshold;
  });

  if (verticalDropLine) return verticalDropLine;

  // If we're inside any drop area, return the first such drop area
  const dropArea = dropAreas.find((area) =>
    area.rects.some(
      (rect) =>
        referencePosition.x >= rect.xStart &&
        referencePosition.x <= rect.xEnd &&
        referencePosition.y >= rect.yStart &&
        referencePosition.y <= rect.yEnd
    )
  );

  if (dropArea) return dropArea;

  // Return the nearest horizontal drop line
  const nearestHorizontalDropLine: [DropLine, number] | null =
    horizontalDropLines.reduce((nearest, dropLine) => {
      const distance = getDropLineDistance(referencePosition, dropLine);
      if (distance === null) return nearest;

      if (!nearest || distance < nearest[1]) {
        return [dropLine, distance];
      }

      return nearest;
    }, null as [DropLine, number] | null);

  return nearestHorizontalDropLine && nearestHorizontalDropLine[0];
};

const getDropLineDistance = (
  referencePosition: XYCoord,
  { type, mainAxis, crossAxis, confineToCrossAxis }: DropLine
): number | null => {
  const [referenceMainAxis, referenceCrossAxis] =
    type === 'verticalDropLine'
      ? [referencePosition.x, referencePosition.y]
      : [referencePosition.y, referencePosition.x];

  const inBounds =
    !confineToCrossAxis ||
    (referenceCrossAxis > crossAxis.start &&
      referenceCrossAxis < crossAxis.end);

  if (!inBounds) return null;

  return Math.abs(mainAxis - referenceMainAxis);
};
