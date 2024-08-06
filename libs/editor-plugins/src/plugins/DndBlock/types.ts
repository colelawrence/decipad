import type { useDragDropManager } from 'react-dnd';
import type { Path } from 'slate';

type DragDropManager = ReturnType<typeof useDragDropManager>;
export type DragDropMonitor = ReturnType<DragDropManager['getMonitor']>;

export type Rect = {
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
};

export type BaseDropLocation = {
  type: string;

  // The ID of the node the drop location is anchored to
  id: string;

  // The path of the node the drop location is anchored to
  path: Path;
};

export type DropLine = BaseDropLocation & {
  type: 'horizontalDropLine' | 'verticalDropLine';

  // Which side of the node the drop line occupies
  direction: 'before' | 'after';

  // The position of the drop line on the axis perpendicular to it
  mainAxis: number;

  // The start and end positions on the parallel axis
  crossAxis: {
    start: number;
    end: number;
  };

  /**
   * If true, the drop line can only be activated when the mouse is within the
   * range specified by crossAxis
   */
  confineToCrossAxis: boolean;
};

export type DropArea = BaseDropLocation & {
  type: 'dropArea';

  /**
   * Regions of the screen that will trigger the drop area. If the mouse is
   * within one of these, all of them will be highlighted.
   */
  rects: Rect[];
};

export type DropLocation = DropLine | DropArea;
