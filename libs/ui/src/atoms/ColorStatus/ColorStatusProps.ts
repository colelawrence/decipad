import type { TColorStatus } from '../../utils';

export type ColorStatusProps = {
  readonly name: TColorStatus;
  readonly selected?: boolean;
  readonly variantStyles?: boolean;
  readonly onChangeStatus?: (status: TColorStatus) => void;
  readonly toggleActionsOpen?: () => void;
};
