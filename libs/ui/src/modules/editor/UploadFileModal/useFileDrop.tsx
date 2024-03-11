import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

export const useFileDrop = (processFile: (file?: File) => void) => {
  return useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop(_, monitor) {
      const { files } = monitor.getItem() as any;
      processFile(files.length === 1 ? files[0] : undefined);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
};
