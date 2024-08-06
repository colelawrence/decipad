import { verticalDropLineThreshold } from './constants';
import { getNearestDropLocation } from './getNearestDropLocation';
import type {
  DropLocation,
  DropLine,
  DropArea,
  BaseDropLocation,
} from './types';

// Drop locations for a node from (100, 50) to (300, 150)
const baseDropLocation: Omit<BaseDropLocation, 'type'> = {
  id: 'my-node',
  path: [0],
};

const dropLineAbove: DropLine = {
  ...baseDropLocation,
  type: 'horizontalDropLine',
  direction: 'before',
  mainAxis: 50,
  crossAxis: {
    start: 100,
    end: 300,
  },
  confineToCrossAxis: false,
};

const dropLineBelow: DropLine = {
  ...baseDropLocation,
  type: 'horizontalDropLine',
  direction: 'after',
  mainAxis: 150,
  crossAxis: {
    start: 100,
    end: 300,
  },
  confineToCrossAxis: false,
};

const dropLineLeft: DropLine = {
  ...baseDropLocation,
  type: 'verticalDropLine',
  direction: 'before',
  mainAxis: 100,
  crossAxis: {
    start: 50,
    end: 150,
  },
  confineToCrossAxis: true,
};

const dropLineRight: DropLine = {
  ...baseDropLocation,
  type: 'verticalDropLine',
  direction: 'after',
  mainAxis: 300,
  crossAxis: {
    start: 50,
    end: 150,
  },
  confineToCrossAxis: true,
};

/**
 * Drop area to the left and right of node, occupying the outer half of each
 * margin
 */
const dropArea: DropArea = {
  ...baseDropLocation,
  type: 'dropArea',
  rects: [
    // Left
    {
      xStart: 0,
      yStart: 50,
      xEnd: 50,
      yEnd: 150,
    },
    // Right
    {
      xStart: 350,
      yStart: 50,
      xEnd: 400,
      yEnd: 150,
    },
  ],
};

const dropLocations: DropLocation[] = [
  dropLineAbove,
  dropLineBelow,
  dropLineLeft,
  dropLineRight,
  dropArea,
];

describe('getNearestDropLocation', () => {
  it('returns the drop area when inside first rect', () => {
    const result = getNearestDropLocation(dropLocations, {
      x: dropArea.rects[0].xEnd - 5,
      y: dropArea.rects[0].yStart + 5,
    });
    expect(result).toBe(dropArea);
  });

  it('returns the drop area when inside second rect', () => {
    const result = getNearestDropLocation(dropLocations, {
      x: dropArea.rects[1].xStart + 5,
      y: dropArea.rects[1].yEnd - 5,
    });
    expect(result).toBe(dropArea);
  });

  it('returns vertical drop line when within threshold of mainAxis and within crossAxis', () => {
    const result1 = getNearestDropLocation(dropLocations, {
      x: dropLineLeft.mainAxis - verticalDropLineThreshold + 2,
      y: dropLineLeft.crossAxis.start + 2,
    });
    expect(result1).toBe(dropLineLeft);

    const result2 = getNearestDropLocation(dropLocations, {
      x: dropLineLeft.mainAxis - verticalDropLineThreshold + 2,
      y: dropLineLeft.crossAxis.end - 2,
    });
    expect(result2).toBe(dropLineLeft);
  });

  it('does not return vertical drop line when outside threshold of main axis', () => {
    const result1 = getNearestDropLocation(dropLocations, {
      x: dropLineLeft.mainAxis - verticalDropLineThreshold - 2,
      y: dropLineLeft.crossAxis.start + 2,
    });
    expect(result1).not.toBe(dropLineLeft);

    const result2 = getNearestDropLocation(dropLocations, {
      x: dropLineLeft.mainAxis + verticalDropLineThreshold + 2,
      y: dropLineLeft.crossAxis.start + 2,
    });
    expect(result2).not.toBe(dropLineLeft);
  });

  it('does not return vertical drop line when outside crossAxis', () => {
    const result1 = getNearestDropLocation(dropLocations, {
      x: dropLineLeft.mainAxis - verticalDropLineThreshold + 2,
      y: dropLineLeft.crossAxis.start - 2,
    });
    expect(result1).not.toBe(dropLineLeft);

    const result2 = getNearestDropLocation(dropLocations, {
      x: dropLineLeft.mainAxis - verticalDropLineThreshold + 2,
      y: dropLineLeft.crossAxis.end + 2,
    });
    expect(result2).not.toBe(dropLineLeft);
  });

  it('returns the nearest horizontal drop line when no other locations match', () => {
    const rightOfLeftRect = dropArea.rects[0].xEnd + 5;
    const leftOfRightRect = dropArea.rects[1].xStart - 5;

    const result1 = getNearestDropLocation(dropLocations, {
      x: rightOfLeftRect,
      y: 60, // Just below the drop line above
    });
    expect(result1).toBe(dropLineAbove);

    const result2 = getNearestDropLocation(dropLocations, {
      x: rightOfLeftRect,
      y: 140, // Just above the drop line below
    });
    expect(result2).toBe(dropLineBelow);

    const result3 = getNearestDropLocation(dropLocations, {
      x: 200, // In the middle of the node
      y: 40, // Just above the drop line above
    });
    expect(result3).toBe(dropLineAbove);

    const result4 = getNearestDropLocation(dropLocations, {
      x: 200, // In the middle of the node
      y: 160, // Just below the drop line below
    });
    expect(result4).toBe(dropLineBelow);

    const result5 = getNearestDropLocation(dropLocations, {
      x: leftOfRightRect,
      y: 40, // Just above the drop line above
    });
    expect(result5).toBe(dropLineAbove);

    const result6 = getNearestDropLocation(dropLocations, {
      x: leftOfRightRect,
      y: 160, // Just belo the drop line below
    });
    expect(result6).toBe(dropLineBelow);
  });

  it('returns null if there are no drop locations', () => {
    const result = getNearestDropLocation([], { x: 0, y: 0 });
    expect(result).toBeNull();
  });
});
