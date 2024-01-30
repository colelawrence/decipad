import { VegaProps } from 'react-vega/lib/Vega';

type SpecConfig = VegaProps['spec']['config'];

export type PlotSpec = VegaProps['spec'] & {
  config?: SpecConfig & {
    encoding?: { color?: { scheme?: string | undefined } };
  };
  encoding?: {
    color?: {
      field?: string | undefined;
      type?: string | undefined;
      legend?: {
        orient?: string;
        direction?: string;
      };
    };
  };
};

export interface PlotResultProps {
  spec: NonNullable<PlotSpec>;
  data: NonNullable<VegaProps['data']>;
  repeatedColumns?: string[];
  onError?: VegaProps['onError'];
}
