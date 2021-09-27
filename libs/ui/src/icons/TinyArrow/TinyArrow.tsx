import { cssVar } from '../../primitives';

export const TinyArrow = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Arrow</title>
    <path
      d="M4.572 4.692 3.35 5.67c-.832.666-1.248.999-1.598 1a1 1 0 0 1-.782-.377C.75 6.02.75 5.487.75 4.421V2.843c0-1.138 0-1.708.23-1.985a1 1 0 0 1 .812-.362c.36.015.782.396 1.628 1.157l1.21 1.088c.385.347.578.52.644.723a.8.8 0 0 1-.016.544c-.078.198-.28.36-.686.684z"
      fill={cssVar('normalTextColor')}
    />
  </svg>
);
