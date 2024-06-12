import type { useDragDropManager } from 'react-dnd';
import type { Path } from 'slate';

type DragDropManager = ReturnType<typeof useDragDropManager>;
export type DragDropMonitor = ReturnType<DragDropManager['getMonitor']>;

export type DropLine = {
  type: 'horizontal' | 'vertical';

  // The ID of the node the drop line is anchored to
  id: string;

  // The path of the node the drop line is anchored to
  path: Path;

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
