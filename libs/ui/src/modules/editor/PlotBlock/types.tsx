import { ComponentProps } from 'react';
import { PlotParams } from '../PlotParams/PlotParams';
import { PlotResult } from '../PlotResult/PlotResult';

export interface PlotBlockProps {
  readonly readOnly?: boolean;
  readonly chartUuid: string;
  readonly plotParams: ComponentProps<typeof PlotParams>;
  readonly result?: ComponentProps<typeof PlotResult>;
  readonly title?: string;
  readonly onTitleChange?: (newValue: string) => void;
}
