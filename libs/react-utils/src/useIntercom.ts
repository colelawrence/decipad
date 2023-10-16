import { noop } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { useIntercom as externalUseIntercom } from 'react-use-intercom';

type UseIntercomReply = Pick<
  ReturnType<typeof externalUseIntercom>,
  'show' | 'showNewMessage'
>;

export const useIntercom = (): UseIntercomReply => {
  try {
    return externalUseIntercom();
  } catch (err) {
    // do nothing
    return {
      show: noop,
      showNewMessage: noop,
    };
  }
};
