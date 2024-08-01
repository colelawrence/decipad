import { FC } from 'react';
import { isText } from '@udecode/plate-common';
import { SmartRef } from '@decipad/ui';
import { useComputer } from '@decipad/editor-hooks';
import { Computer } from '@decipad/computer-interfaces';
import { type ParsedCellValue } from './types';

interface SmartRefSymbolObserverProps {
  computer: Computer;
  blockId: string;
}

const SmartRefSymbolObserver: FC<SmartRefSymbolObserverProps> = ({
  blockId,
  computer,
}) => {
  return (
    <SmartRef
      symbolName={computer.getSymbolDefinedInBlock$.use(blockId)}
      defBlockId={blockId}
    />
  );
};

interface SmartRefObserverProps {
  computer: Computer;
  part: ParsedCellValue[number];
}

const SmartRefObserver = ({ part, computer }: SmartRefObserverProps) => {
  if (isText(part)) {
    return <>{part.text}</>;
  }

  return <SmartRefSymbolObserver blockId={part.blockId} computer={computer} />;
};

export const useRenderReadonlyCellEditor = (cellValue: ParsedCellValue) => {
  const computer = useComputer();
  return cellValue.map((part, index) => (
    <SmartRefObserver key={index} part={part} computer={computer} />
  ));
};
