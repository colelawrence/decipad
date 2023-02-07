import { useToast } from '@decipad/toast';
import { OperationResult } from 'urql';

type Fn<TArgs, TResult extends OperationResult> = (
  arg: TArgs
) => Promise<TResult>;

export const useMutationResultHandler = <
  TArgs,
  TResult extends OperationResult
>(
  fn: Fn<TArgs, TResult>,
  errorMessage = 'Server error, please contact support'
): ((args: TArgs) => Promise<TResult['data'] | void>) => {
  const toast = useToast();

  return async (args: TArgs) => {
    try {
      const resp = await fn(args);
      if (resp == null) {
        console.error('No response');
        toast(
          'No response to mutation request. Please contact support',
          'error'
        );
        return;
      }
      const { data, error } = resp;
      if (error != null) {
        console.error(error);
        toast(errorMessage, 'error');
        return;
      }
      if (data == null) {
        console.error('No data on response');
        toast('No data on mutation response. Please contact support', 'error');
        return;
      }
      return data;
    } catch (err) {
      console.error(err);
      toast(errorMessage, 'error');
    }
  };
};
